'use strict';
var logger = require('nodelogger').Logger(__filename);
var _ = require('lodash');

var mock = require('./lib/Model');
var db = require('./lib/db');

module.exports = function (mongoose) {
    var Models = {};
    if (!mongoose.originalCreateConnection) {
        mongoose.originalCreateConnection = mongoose.createConnection;
        mongoose.originalConnect = mongoose.connect;
        mongoose.originalModel = mongoose.model;
    }

    mongoose.model = function (name, schema, collection, skipInit) {
        if (name) {
            name = name.toLowerCase();
        }
        var model = mongoose.originalModel.call(mongoose, name, schema, collection, skipInit);
        mock(model);
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
        var connection = mongoose.originalCreateConnection.call(mongoose, database, options, function () {
            if (callback) {
                //Always return true as we are faking it.
                callback(null, connection);
            }
        });
        connection.model = mongoose.model;
//        mongoose.connection.model = mongoose.model;
        return connection;
    };

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
        var connection = mongoose.originalConnect.call(mongoose, database, options, function () {
            if (callback) {
                //Always return true as we are faking it.
                callback(null, connection);
            }
        });
        connection.model = mongoose.model;
        mongoose.connection.model = mongoose.model;
        return connection;
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


