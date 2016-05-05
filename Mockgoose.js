"use strict";

var mongod;
if (process.env.MONGODB_LOCAL_BUILD) {
    console.log("WARNING: USING ../mongodb-prebuilt, this option is for development only");
    mongod = require('../mongodb-prebuilt');
} else {
    mongod = require('mongodb-prebuilt');
}

var rimraf = require('rimraf');
var debug = require('debug')('Mockgoose');
var portfinder = require('portfinder');
var path = require('path');
var fs = require('fs');
var Q = require('q');

module.exports = function(mongoose, db_opts) {
    var deferred = Q.defer();
    var orig_connect = mongoose.connect;
    var orig_createConnection = mongoose.createConnection;

    // caching original connect arguments for unmock method
    var orig_connect_uri;
    var orig_createConnection_uri;
    var connect_type = "";

    var connect_args;
    var createConnection_args;

    if (!db_opts) {
        db_opts = {};
    }

    var db_version;
    if (!db_opts.version) {
        db_version = mongod.active_version();
    } else {
        db_version = db_opts.version;
    }

    delete db_opts.version;

    if (!db_opts.storageEngine) {
        var parsed_version = db_version.split('.');
        if (parsed_version[0] >= 3 && parsed_version[1] >= 2) {
            db_opts.storageEngine = "ephemeralForTest";
        } else {
            db_opts.storageEngine = "inMemoryExperiment";
        }
    }

    db_opts.bind_ip = "127.0.0.1";

    if (!db_opts.port) {
        db_opts.port = 27017;
    } else {
        db_opts.port = Number(db_opts.port);
    }

    if (!db_opts.dbpath) {
        db_opts.dbpath = path.join(__dirname, ".mongooseTempDB");
        debug("dbpath: %s", db_opts.dbpath);
    }

    try {
        fs.mkdirSync(db_opts.dbpath);
    } catch (e) {
        if (e.code !== "EEXIST") {
            throw e;
        }
    }

    var orig_dbpath = db_opts.dbpath;
    start_server(db_opts, function(mockgoose_uri) {
        // for now no errors
        mongoose.connect = function() {
            connect_type = "connect";
            connect_args = arguments;
            orig_connect_uri = connect_args[0];
            connect_args[0] = mockgoose_uri;
            return orig_connect.apply(mongoose, connect_args);
        };

        mongoose.createConnection = function() {
            connect_type = "createConnection";
            createConnection_args = arguments;
            orig_createConnection_uri = createConnection_args[0];
            createConnection_args[0] = mockgoose_uri;
            return orig_createConnection.apply(mongoose, createConnection_args);
        };

        mongoose.isMocked = true;

        mongoose.connection.once('disconnected', function() {
            debug('Mongoose disconnected');
        });
        deferred.resolve(mockgoose_uri);
    });



    function start_server(db_opts, start_server_callback) {
        debug("Starting to look for available port, base: %s:%d", db_opts.bind_ip, db_opts.port);
        portfinder.getPort({
            host: db_opts.bind_ip,
            port: db_opts.port,
        }, function(err, freePort) {
            if (err) {
                debug("error from portfinder:", err);
                throw err;
            }

            db_opts.port = freePort;
            debug("attempting to start server on %s:%d", db_opts.bind_ip, db_opts.port);

            db_opts.dbpath = path.join(orig_dbpath, db_opts.port.toString());

            /*
                when in place upgrade is done of mongodb,
                we need to clean directory first, otherwise
                this error is returned:
                    exception in initAndListen: 28662 Cannot start server. 
                    Detected data files in /Mockgoose/.mongooseTempDB/27017 
                    created by the 'inMemoryExperiment' storage engine, 
                    but the specified storage engine was 'ephemeralForTest'., 
                    terminating
            */
            rimraf(db_opts.dbpath, function(err) {
                debug("Error from rimraf:", err);
                try {
                    fs.mkdirSync(db_opts.dbpath);
                } catch (e) {
                    if (e.code !== "EEXIST") {
                        throw e;
                    }
                }

                var server_opts = {
                    args: db_opts,
                    auto_shutdown: true
                };

                var startResult = mongod.start_server(server_opts);
                if (startResult === 0) {
                    debug('mongod.start_server connected');
                    var mock_uri = "mongodb://localhost:" + db_opts.port;
                    start_server_callback(mock_uri);
                } else {
                    debug('unable to start mongodb on: %d', freePort);
                    db_opts.port = ++freePort;
                    start_server(db_opts, start_server_callback);
                }
            });
        });
    }

    module.exports.reset = function(done) {
        mongoose.connection.db.dropDatabase(function(err) {
            if (typeof done === "function") {
                done(err);
            }
        });
    };

    mongoose.unmock = function(callback) {
        mongoose.disconnect(function() {
            delete mongoose.isMocked;
            connect_args[0] = orig_connect_uri;
            mongoose.connect = orig_connect;
            callback();
        });
    };

    mongoose.unmockAndReconnect = function(callback) {
        mongoose.unmock(function() {
            var overloaded_callback = function(err) {
                callback(err);
            };
            // mongoose connect prototype connect(String, Object?, Function?)
            if (connect_args[2] && typeof connect_args[2] === "function") {
                connect_args[2] = overloaded_callback;
            } else {
                connect_args[1] = overloaded_callback;
            }

            orig_connect.apply(mongoose, connect_args);
        });
    };

    return deferred.promise;
};
