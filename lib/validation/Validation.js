'use strict';

var db = require('./../db');
var util = require('util');
var utils = require('./../utils');
var _ = require('lodash');

/**
 * Duplicate path validation.
 * @type {Function}
 */
module.exports.validate = validateOptions;

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

function validateOptions(type, doc, schema, cb) {
    var error = null;
    _.forIn(schema.paths, function (value, pathName) {
        error = validatePath(doc, schema, pathName, type, error);
    });
    cb(error);
}