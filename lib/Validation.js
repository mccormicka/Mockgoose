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
//            var modelID = model._id.toString();
//            db[type][modelID] = model;

            if (!cb) {
                throw new Error('Mongoose save callback must be defined!');
            }
            return cb(null, model);
        });
    });
}


function validatePath(doc, schema, pathName, type, error) {
    var path = schema.paths[pathName];
    if (path.options.unique) {
        var query = {};
        query[pathName] = doc[pathName];
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

module.exports.validate = validateOptions;

function validateOptions(type, doc, schema, cb) {
    var error = null;
    if (!db[type][doc._id.toString()]) {
        for (var pathName in schema.paths) {
            if (schema.paths.hasOwnProperty(pathName)) {
                error = validatePath(doc, schema, pathName, type, error);
                if(error){
                    break;
                }
            }
        }
    }
    cb(error);
}