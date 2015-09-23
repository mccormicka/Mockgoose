'use strict';

var _ = require('lodash');
var ObjectId = require('../Types').ObjectId;

module.exports = function sortItems(sort, items) {
    var item = items[0];
    if (!_.isUndefined(item) && !_.isUndefined(sort)) {
        var sortOptions = [];
        var sortDirections = [];
        _.forIn(sort, function (sortOrder, sortKey) {
            sortOptions.push(sortKey);
            sortDirections.push(sortOrder >= 0);
        });
        items = _.sortByOrder(items, sortOptions, sortDirections);
    }
    return items;
};
