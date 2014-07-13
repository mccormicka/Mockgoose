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

function validateOptions(type, doc, schema, cb) {
    var indexes = schema.indexes();
    for (var i = 0, il = indexes.length; i < il; ++i) {
        if(indexes[i][1].unique) {
            var query = createQuery(indexes[i][0], doc);
            var results = utils.findModelQuery(db[type], query);
            if (results.length > 0) {
                return cb(createError(Object.keys(indexes[i][0]).join(', ')));
            }
        }
    }
    return cb(null);
}

function createQuery(fields, doc) {
    var query = {};
    _.forIn(fields, function (value, pathName) {
        query[pathName] = doc[pathName];
    });
    return query;
}

function createError(indexName) {
    var errMessage = util.format('E11000 duplicate key error index: %s', indexName);
    var code = 11000;
    var error = new Error(errMessage, code);
    error.name = 'MongoError';
    error.code = code;
    return error;
}
