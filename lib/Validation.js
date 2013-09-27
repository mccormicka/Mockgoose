'use strict';

var db = require('./db');
var util = require('util');
var utils = require('./utils');

module.exports.validateModel = validateModel;

function validateModel(model, cb, type, Model) {
    model.validate(function (err) {
        if (err) {
            return cb(err);
        }
        validateOptions(type, model, function (err) {
            if (err) {
                return cb(err, null);
            }

            var modelID = model._id.toString();
            var temp = model.toObject();
            temp.mockModel = Model;
            temp._id = modelID;
            db[type][modelID] = temp;
            if (!cb) {
                throw new Error('Mongoose save callback must be defined!');
            }
            return cb(null, model);
        });
    });
}


function validatePath(model, pathName, type, error) {
    var path = model.schema.paths[pathName];
    if (path.options.unique) {
        var query = {};
        query[pathName] = model[pathName];
        var results = utils.findModelQuery(db[type], query);
        if (results.length > 0) {
            var errMessage = util.format('E11000 duplicate key error index: %s', pathName);
            var code = 11000;
            error = new Error(errMessage, code);
            error.name = 'MongoError';
            error.code = code;
            return error;
        }
    }
    return error;
}

function validateOptions(type, model, cb) {
    var error = null;
    if (!db[type][model._id.toString()]) {
        for (var pathName in model.schema.paths) {
            if (model.schema.paths.hasOwnProperty(pathName)) {
                error = validatePath(model, pathName, type, error);
            }
        }
    }
    cb(error);
}