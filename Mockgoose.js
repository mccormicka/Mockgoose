'use strict';

var mongod = require('mongodb-prebuilt');
//var mongod = require('../mongodb-prebuilt');
var async = require('async');
var path = require('path');
var fs = require('fs');
var debug = require('debug')('Mockgoose');
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();
var server_started = false;

module.exports = function(mongoose, db_opts) {
    var orig_connect = mongoose.connect;

    var connect_args;
    mongoose.connect = function() {
        connect_args = arguments;
        start_server(db_opts);
    }

    emitter.once("mongodbStarted", function(db_opts) {
        connect_args[0] = "mongodb://localhost:" + db_opts.port;
        debug("connecting to %s", connect_args[0]);
        orig_connect.apply(mongoose, connect_args);
    });

    if (!db_opts) db_opts = {};

    if (! db_opts.storageEngine ) {
        db_opts.storageEngine = "inMemoryExperiment";
    }

    if (! db_opts.port ) {
        db_opts.port = 27017;
    } else {
        db_opts.port = Number(db_opts.port);
    }

    if (! db_opts.dbpath ) {
        db_opts.dbpath = path.join(__dirname, ".mongooseTempDB");
        debug("dbpath: %s", db_opts.dbpath);
    }

    try {
        fs.mkdirSync(db_opts.dbpath);
    } catch (e) {
        if (e.code !== "EEXIST" ) throw e;
    }

    var orig_dbpath = db_opts.dbpath;
    function start_server(db_opts) {
        debug("attempting to start server on port: %d", db_opts.port);
        db_opts.dbpath = path.join(orig_dbpath, db_opts.port.toString());

        try {
            fs.mkdirSync(db_opts.dbpath);
        } catch (e) {
            if (e.code !== "EEXIST" ) throw e;
        }

        mongod.start_server({args: db_opts, auto_shutdown: true}, function(err) {
            if (!err) {
                emitter.emit('mongodbStarted', db_opts);
            } else {
                db_opts.port++;
                start_server(db_opts);
            }
        });
    }

    // process.on('uncaughtException', function(err) {
    //     //if ( restarting === true ) return;
    //     if (err.code !== "ENOTCONN") {
    //         throw err;
    //     }
    // });
    module.exports.reset = function(done) {
        var collections = mongoose.connection.collections,
            remaining = collections.length;
        if (remaining === 0) {
            done(null);
        }
        collections.forEach(function(obj) {
            obj.deleteMany(null, function() {
                remaining--;
                if (remaining === 0) {
                    done(null);
                }
            });
        });
    };

    return emitter;
}
