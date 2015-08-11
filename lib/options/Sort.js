'use strict';

var _ = require('lodash');
var ObjectId = require('../Types').ObjectId;

module.exports = function sortItems(sort, items) {
    var item = items[0];
    if (!_.isUndefined(item) && !_.isUndefined(sort)) {
        _.forIn(sort, function (value, key) {
            if (item[key]) {
                if (item[key] instanceof ObjectId) {
                    sortObjectId(value, items, key);
                }
                else if (_.isNumber(item[key])) {
                    sortNumeric(value, items, key);
                }
                else if(item[key] instanceof Date) {
                    sortDate(value, items, key);
                }
                else {
                    sortAlpha(value, items, key);
                }
            }
        });
    }
    return items;
};

//-------------------------------------------------------------------------
//
// Private Methods
//
//-------------------------------------------------------------------------

function sortObjectId(value, items, key) {
    if (value >= 0) {
        items.sort(function (a, b) {
            return a[key] ? a[key].id.localeCompare(b[key].id) : 1;
        });
    } else {
        items.sort(function (a, b) {
            return b[key] ? b[key].id.localeCompare(a[key].id) : -1;
        });
    }
}

function sortDate(value, items, key){
    return sortNumeric(value, items, key);
}

function sortNumeric(value, items, key) {
    if (value >= 0) {
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
    if (value >= 0) {
        items.sort(function (a, b) {
            return a[key] ? a[key].localeCompare(b[key]) : 1;
        });
    } else {
        items.sort(function (a, b) {
            return b[key] ? b[key].localeCompare(a[key]) : -1;
        });
    }
}
