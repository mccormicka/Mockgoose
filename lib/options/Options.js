'use strict';

var _ = require('lodash');
var filter = require('./Filter');
var sort = require('./Sort');

module.exports.applyOptions = function applyOptions(options, items) {
    if (!_.isNull(options) && !_.isUndefined(options)) {
        items = sort(options.sort, items);
        items = filter(options.fields, items);
    }
    return items;
};

