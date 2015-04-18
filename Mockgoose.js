'use strict';
var _ = require('lodash');

var mock = require('./lib/Model');
var db = require('./lib/db');
var logger = require('./lib/Logger');

module.exports = function (mongoose, throwErrors) {

    var Models = {};
    if (!mongoose.originalCreateConnection) {
        mongoose.originalCreateConnection = mongoose.createConnection;
        mongoose.originalConnect = mongoose.connect;
        mongoose.originalModel = mongoose.model;
    }

    mongoose.model = function (name, schema, collection, skipInit) {
//        Mongoose is case sensitive!
//        if (name) {
//            name = name.toLowerCase();
//        }
        var model = mongoose.originalModel.call(mongoose, name, schema, collection, skipInit);
        mock(model);
        if(model.schema.options.autoIndex){
            model.ensureIndexes();
        }
        Models[name] = model;
        return model;
    };

    mongoose.createConnection = function (host, database, port, options, callback) {
        if (_.isFunction(database)) {
            callback = database;
            database = null;
        }
        if (!_.isString(database) && _.isString(host)) {
            database = host.slice(host.lastIndexOf('/') + 1);
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
        if (_.isObject(options)) {
            if (_.isString(options.db)) {
                database = options.db;
            }
            options = {};
        }
        if (_.isUndefined(options)) {
            options = {};
        }

        logger.info('Creating Mockgoose database: CreateConnection', database, ' options: ', options);
        var connection = mongoose.originalCreateConnection.call(mongoose, database, options, function (err) {
            process.nextTick(function() {
                handleConnection(callback, connection, err);
            });
        });
        connection.model = mongoose.model;
        connection.models = mongoose.models;
        return connection;
    };

    function handleConnection(callback, connection, err) {
        setMockReadyState(connection, 2);
        connection.emit('connecting');
        if (callback) {
            //Always return true as we are faking it.
            callback(null, connection);
        }
        if (throwErrors) {
            setMockReadyState(connection, 0);
            connection.emit('error', err);
        } else {
            setMockReadyState(connection, 1);
            connection.emit('connected');
            connection.emit('open');
        }
    }

    mongoose.connect = function (host, database, port, options, callback) {
        if (_.isFunction(database)) {
            callback = database;
            database = null;
        }
        if (!_.isString(database)) {
            database = host.slice(host.lastIndexOf('/') + 1);
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
        if (_.isObject(options)) {
            if (_.isString(options.db)) {
                database = options.db;
            }
            options = {};
        }
        if (_.isUndefined(options)) {
            options = {};
        }

        logger.info('Creating Mockgoose database: Connect ', database, ' options: ', options);
        mongoose.originalConnect(database, options, function (err) {
            handleConnection(callback, mongoose.connection, err);
        });
        mongoose.connection.model = mongoose.model;
        return mongoose;
    };

    var setMockReadyState = module.exports.setMockReadyState = function(connection, state) {
        /**
         * mock version of Connection#readyState
         * http://mongoosejs.com/docs/api.html#connection_Connection-readyState
         *
         * 0 = disconnected
         * 1 = connected
         * 2 = connecting
         * 3 = disconnecting
         *
         */
        connection._mockReadyState = mongoose.connection._mockReadyState = state;
    };

    module.exports.reset = function (type) {
        if (!type) {
            _.map(Models, function (value, key) {
                delete Models[key];
            });
        } else {
            delete Models[type];
        }
        db.reset(type);
    };
    return mongoose;
};
