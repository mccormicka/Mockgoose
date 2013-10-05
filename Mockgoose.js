'use strict';
var logger = require('nodelogger').Logger(__filename);
var _ = require('lodash');

var mock = require('./lib/Model');
module.exports = function (mongoose) {
    if( !mongoose.originalConnection){
        mongoose.originalConnection = mongoose.createConnection;
    }

    mongoose.createConnection = function (host, database, port, options, callback) {
        if(_.isFunction(database)){
            callback = database;
            database = null;
        }
        if(!_.isString(database)){
            database = host.slice(host.lastIndexOf('/')+1);
        }
        if (_.isFunction(database)) {
            callback = database;
            options = {};
        } else if (_.isFunction(port)) {
            callback = port;
            options = {};
        } else if (_.isFunction(options)) {
            callback = options;
            options = {};
        }
        if(_.isObject(options)){
            if(_.isString(options.db)){
                database = options.db;
            }
            options = {};
        }
        if(_.isUndefined(options)){
            options = {};
        }

        logger.info('Creating Mockgoose database: ', database, ' options: ', options);
        var connection = mongoose.originalConnection.call(mongoose, database, options, function () {
            if (callback) {
                //Always return true as we are faking it.
                callback(null, connection);
            }
        });

        var originalModel = connection.model;
        connection.model = function (type, schema) {
            var model = originalModel.call(connection, type, schema);
            mock(model);
            if(!module.exports.reset()){
                module.exports.reset = model.reset;
            }
            return model;
        };
        mongoose.connection.model = connection.model;
        return connection;
    };

    mongoose.connect= function(host, database, port, options, callback){
        var connection = mongoose.createConnection(host, database, port, options, callback);
        return connection;
    };

    module.exports.reset = function(){
        return false;
    };
    return mongoose;
};


