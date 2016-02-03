'use strict';

var mongod;
if ( process.env.MONGODB_LOCAL_BUILD ) {
    console.log("WARNING: USING ../mongodb-prebuilt, this option is for development only");
    mongod = require('../mongodb-prebuilt');
} else {
    mongod = require('mongodb-prebuilt');
}
var path = require('path');
var fs = require('fs');
var debug = require('debug')('Mockgoose');
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();
var server_started = false;
var mongod_emitter;

module.exports = function(mongoose, db_opts) {
    var orig_connect = mongoose.connect;

	// caching original connect arguments for unmock method
	var orig_connect_uri;

    var connect_args;
    mongoose.connect = function() {
        connect_args = arguments;
		orig_connect_uri = connect_args[0];
        start_server(db_opts);
    }

	mongoose.isMocked = true;

    mongoose.connection.on('disconnected', function () {
        debug('Mongoose disconnected');
        mongod_emitter.emit('mongoShutdown');
    });

    emitter.on("mongodbStarted", function(db_opts) {
        connect_args[0] = "mongodb://localhost:" + db_opts.port;
        debug("connecting to %s", connect_args[0]);
        orig_connect.apply(mongoose, connect_args);
    });

    if (!db_opts) db_opts = {};

    var db_version;
    if (! db_opts.version ) {
        db_version = mongod.active_version();
    } else {
        db_version = db_opts.version;
    }

    delete db_opts.version;

    if (! db_opts.storageEngine ) {
        var parsed_version = db_version.split('.');
        if ( parsed_version[0] >= 3 && parsed_version[1] >= 2 ) {
            db_opts.storageEngine = "ephemeralForTest";
        } else {
            db_opts.storageEngine = "inMemoryExperiment";
        }
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

        mongod_emitter = mongod.start_server({args: db_opts, auto_shutdown: true}, function(err) {
            if (!err) {
                emitter.emit('mongodbStarted', db_opts);
            } else {
                db_opts.port++;
                start_server(db_opts);
            }
        });
    }

    module.exports.reset = function(done) {
      var collections = mongoose.connection.collections;
      var models = mongoose.models;
      var remainingCollections = Object.keys(collections).length;
      var remainingModels = Object.keys(models).length;

      if (remainingCollections === 0 && remainingModels === 0) {
        done(null);
      }

      for( var model_name in models ) {
        delete models[model_name];
        remainingModels--;
      }

      if (remainingCollections === 0 && remainingModels === 0) {
        done(null);
      }

      for( var collection_name in collections ) {
        var obj = collections[collection_name];
        obj.deleteMany(null, function() {
          remainingCollections--;
          if (remainingCollections === 0 && remainingModels === 0) {
            done(null);
          }
        });
      }
    };

	mongoose.unmock = function(callback) {
		mongoose.disconnect(function() {
			delete mongoose.isMocked;
			connect_args[0] = orig_connect_uri;
			mongoose.connect = orig_connect;
			emitter.removeAllListeners();
			callback();
		});
	}

	mongoose.unmockAndReconnect = function(callback) {
		mongoose.unmock(function() {
			var overloaded_callback = function(err) {
				callback(err);
			}
			// mongoose connect prototype connect(String, Object?, Function?)
			if ( connect_args[2] && typeof connect_args[2] === "function" ) {
				connect_args[2] = overloaded_callback;
			} else {
				connect_args[1] = overloaded_callback;
			}

			orig_connect.apply(mongoose, connect_args);
		});
	}


    return emitter;
}
