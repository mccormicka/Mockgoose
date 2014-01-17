'use strict';

var _ = require('lodash');
var mask = require('mongoosemask');

module.exports = function filterFields(fields, results) {
    var includes = [];
    var excludes = [];
    if (fields) {
        if (_.isObject(fields)) {
            _.forIn(fields, function (value, key) {
                if (!!value ) {
                    includes.push(key);
                } else {
                    excludes.push(key);
                }
            });
        } else if (_.isString(fields)) {
            _.each(fields.split(' '), function (field) {
                if (field.indexOf('-') > -1) {
                    excludes.push(field.slice(1));
                } else {
                    includes.push(field);
                }
            });
        } else {
            throw new Error('Fields must be a string or an object!');
        }
    }
    if(includes.length && excludes.length ){
        var error = new Error('You cannot currently mix including and excluding fields. Contact us if this is an issue.');
        error.name = 'MongoError';
        return error;
    }

    if (includes.length || excludes.length) {
        results = _.map(results, function (result) {
            if (includes.length) {
                result = mask.expose(result, includes);
            }
            if (excludes.length) {
                result = mask.mask(result, excludes);
            }
            return result;
        });
    }
    return results;
};