'use strict';

var _ = require('lodash');
var filter = require('./Filter');
var sort = require('./Sort');
var skip = require('./Skip');
var limit = require('./Limit');
var operations = require('../operations/Operations');

module.exports.applyOptions = function applyOptions(options, items) {
    if (!_.isNull(options) && !_.isUndefined(options)) {
        items = sort(options.sort, items);
        items = skip(options.skip, items);
        items = limit(options.limit, items);
        items = filter(options.fields, items);
        items = applyOperations(options.fields, items);
    }
    return items;
};

function applyOperations(fields, items) {
    if (_.isObject(fields)) {
        _.each(items, function (item) {
            _.each(_.keys(fields), function (key) {
                var value = fields[key];
                if (operations.isOperation(value)) {
                    item[key] = _.find(item[key], function (element) {
                        return operations.getOperation(value)(element, value, {queryItem: key});
                    });
                }
            });
        });
    }
    return items;
}

