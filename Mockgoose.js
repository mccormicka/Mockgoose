'use strict';

var mock = require('./MockModel');

module.exports = function (mongoose) {
    var originalConnection = mongoose.createConnection;

    mongoose.createConnection = function (address, openListener) {
        console.log('Creating Mockgoose database ', address);

        var tempAddress = address;
        var base = 'mongodb://';
        var host;
        var database;
        if (address.indexOf(base) > -1) {
            tempAddress = address.slice(base.length);
        }
        var dbIndex = tempAddress.indexOf(':');
        //We have a port
        if (dbIndex === -1) {
            dbIndex = tempAddress.indexOf('/');
        }
        host = tempAddress.slice(0, dbIndex);
        dbIndex = tempAddress.indexOf('/');
        database = tempAddress.slice(dbIndex);

        var newAddress = base + host + ':0' + database;
        var connection = originalConnection.call(mongoose, newAddress, function (err) {
            if (openListener) {
                openListener();
            }
        });

        var originalModel = connection.model;
        connection.model = function (type, schema) {
            console.log('Mockgoose Model ', type);
            var model = originalModel.call(connection, type, schema);
            mock(model);
            if(!module.exports.reset()){
                module.exports.reset = model.reset;
            }
            return model;
        };

        return connection;
    };

    module.exports.reset = function(){
        console.log('resetting mockgoose');
        return false;
    };
    return mongoose;
};


