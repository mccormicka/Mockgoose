'use strict';
var logger = require('nodelogger').Logger(__filename);
var EventEmitter = require('events').EventEmitter;

var mock = require('./lib/Model');
module.exports = function (mongoose) {
    if( !mongoose.originalConnection){
        mongoose.originalConnection = mongoose.createConnection;
    }

    mongoose.createConnection = function (address, openListener) {
        logger.info('Creating Mockgoose database ', address);

        var tempAddress = address;
        var base = 'mongodb://';
        var database;
        if (address.indexOf(base) > -1) {
            tempAddress = address.slice(base.length);
        }
        var dbIndex = tempAddress.indexOf(':');
        //We have a port
        if (dbIndex === -1) {
            dbIndex = tempAddress.indexOf('/');
        }
        dbIndex = tempAddress.indexOf('/');
        database = tempAddress.slice(dbIndex+1);

        var connection = mongoose.originalConnection.call(mongoose, database, function () {
            if (openListener) {
                //Always return true as we are faking it.
                openListener(null, connection);
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

    mongoose.connect= function(address){
        var connection = mongoose.createConnection(address, function(){
            logger.info('Connected to Mockgoose', address);
            EventEmitter.emit('connected');
        });
        return connection;
    };

    module.exports.reset = function(){
        return false;
    };
    return mongoose;
};


