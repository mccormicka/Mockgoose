'use strict';

var mock = require('./MockModel');
module.exports = function (mongoose) {
    if( !mongoose.originalConnection){
        mongoose.originalConnection = mongoose.createConnection;
    }

    mongoose.createConnection = function (address, openListener) {
        console.log('Creating Mockgoose database ', address);

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

        var connection = mongoose.originalConnection.call(mongoose, database, function (err) {
            if (openListener) {
                openListener(err);
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
            console.log('TODO dispatch open event here');
        });
        return connection;
    };

    module.exports.reset = function(){
        console.log('resetting mockgoose');
        return false;
    };
    return mongoose;
};


