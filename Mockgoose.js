'use strict';

var mongod = require('mongodb-prebuilt');
var path = require('path');
var fs = require('fs');
var debug = require('debug')('Mockgoose');

module.exports = function(mongoose, db_opts, callback) {
    if (db_opts instanceof Function) {
        callback = db_opts;
        db_opts = {};
    }

    var orig_connect = mongoose.connect;

    //  create temp directory for db lock files, etc..
    if (! db_opts.dbpath ) {
        db_opts.dbpath = path.join(__dirname, ".mongooseTempDB");
        debug("dbpath: %s", db_opts.dbpath);

        try {
            fs.readdirSync(db_opts.dbpath).forEach(function(file,index){
                var curPath = path.join(db_opts.dbpath, file);
                fs.unlinkSync(curPath);
            });
            fs.rmdirSync(db_opts.dbpath);
        } catch(e) {
            if (!e.code === "ENOENT") throw e;
        }
    }

    try {
        fs.mkdirSync(db_opts.dbpath);
    } catch (e) {
        if (e.code !== "EEXIST" ) throw e;
    }

    if (! db_opts.storageEngine ) {
        db_opts.storageEngine = "inMemoryExperiment";
    }

    if (! db_opts.port ) {
        db_opts.port = 27017;
        db_opts.port_roll = true;
    }

    mongoose.connect = function(uri) {
        debug("connecting to %s", uri);
        return orig_connect.apply(this, arguments);
    }

    function start_server(port) {
        try {
            db_opts.port = port;
            mongod.start_server(db_opts, function(err) {
                if (err) console.log(err); 
                if (callback) return callback(err);
            });
        } catch(e) {
            console.log(e);
            throw e;
        }
    }
    start_server(db_opts.port);
    
    
}

// function connect (mongoose, callback) {

// }

// overload connect call URI with mockgoose URI