'use strict';

var logger = require('nodelogger').Logger(__filename);
var _ = require('lodash');

module.exports.applyOptions = applyOptions;

function applyOptions(options, items) {
    if (!_.isNull(options) && !_.isUndefined(options)) {
        items = sortItems(options.sort, items);
        items = filterFields(options.fields, items);
    }
    return items;
}

function sortNumeric(value, items, key) {
    if (value === 1) {
        items.sort(function (a, b) {
            return a[key] - b[key];
        });
    } else {
        items.sort(function (a, b) {
            return b[key] - a[key];
        });
    }
}

function sortAlpha(value, items, key) {
    if (value === 1) {
        items.sort(function (a, b) {
            return a[key].localeCompare(b[key]);
        });
    } else {
        items.sort(function (a, b) {
            return b[key].localeCompare(a[key]);
        });
    }
}

function sortItems(sort, items) {
    var item = items[0];
    if (!_.isUndefined(item) && !_.isUndefined(sort)) {
        _.forIn(sort, function (value, key) {
            if (item[key]) {
                if (_.isNumber(item[key])) {
                    sortNumeric(value, items, key);
                } else {
                    sortAlpha(value, items, key);
                }
            }
        });
    }
    return items;
}

function filterFields(fields, results) {
    var includes = [];
    var excludes = [];
    if (fields) {
        if (_.isObject(fields)) {
            _.forIn(fields, function (value, key) {
                if (value === 1) {
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

    if (includes.length || excludes.length) {
        results = _.map(results, function (result) {
            if (includes.length) {
                result._doc = mask.expose(result, includes);
            }
            if (excludes.length) {
                result._doc = mask.mask(result, excludes);
            }
            return result;
        });
    }
    return results;
}