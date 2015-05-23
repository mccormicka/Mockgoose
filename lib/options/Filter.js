'use strict';

var _ = require('lodash');
var mask = require('mongoosemask');

module.exports = function filterFields(fields, results) {
    var includes = [];
    var excludes = [];
    var projections = {};
    if (fields) {
        if (_.isObject(fields)) {
            _.forIn(fields, function (value, key) {
                if (_.isObject(value)) {
                    projections[key] = value;
                } else if (!!value ) {
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
    var error;
    if(includes.length && excludes.length && ( excludes.length > 1 || excludes[0] !== '_id' )  ){
        error = new Error('You cannot currently mix including and excluding fields. Contact us if this is an issue.');
        error.name = 'MongoError';
        return error;
    }
    var hasProjections = Object.keys(projections).length;
    if (hasProjections && (includes.length || excludes.length)) {
        error = new Error('You cannot currently mix projections and including or excluding fields. Contact us if this is an issue.');
        error.name = 'MongoError';
        return error;
    }

    if (hasProjections) {
        _.forEach(results, function(result) {
            _.forIn(projections, function(value, key) {
                if (value.$slice) {
                    if (_.isArray(value.$slice)) {
                        result[key] = result[key].slice(value.$slice[0], value.$slice[1]);
                    } else {
                        result[key] = result[key].slice(value.$slice);
                    }
                } else if (value.$) {
                    result[key] = result[key][0];
                }
            });

        });
        if (error) {
            return error;
        }
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
