'use strict';

var _ = require('lodash');
var ObjectId = require('../Types').ObjectId;

module.exports = function sortItems(sort, items) {
    var item, sortFns;
    
    item = items[0];
    sortFns = [];

    if (!_.isUndefined(item) && !_.isUndefined(sort)) {
        _.forIn(sort, function (sortOrder, sortKey) {
            var itemVal, sortFn;
            
            itemVal = _.property(sortKey)(item);

            if(!_.isUndefined(itemVal)){
                if (itemVal instanceof ObjectId) {
                    sortFn = sortObjectId(sortOrder);
                } else if (_.isNumber(itemVal)) {
                    sortFn = sortNumeric(sortOrder);
                } else if(itemVal instanceof Date) {
                    sortFn = sortDate(sortOrder);
                } else {
                    sortFn = sortAlpha(sortOrder);
                }

                sortFns.push(function(a, b) {
                    var aVal, bVal;
                    aVal = _.property(sortKey)(a);
                    bVal = _.property(sortKey)(b);

                    return sortFn(aVal, bVal);
                });
            }
        });

        if (sortFns.length > 0) {
            items.sort(sortByAll(sortFns));
        }
    }

    return items;
};

//-------------------------------------------------------------------------
//
// Private Methods
//
//-------------------------------------------------------------------------

function sortByAll(sortFns) {
    return function(a, b) {
        var i, sortResult;

        sortResult = 0;

        for(i = 0; i < sortFns.length; i += 1) {
            sortResult = sortFns[i](a, b);

            if(sortResult !== 0) {
                return sortResult;
            }
        }

        return sortResult;
    };
}

function sortObjectId(sortOrder) {
    return function (a, b) {
        if (sortOrder >= 0) {
            return !_.isUndefined(a) ? a.toString().localeCompare(b.toString()) : 1;
        } else {
            return !_.isUndefined(b) ? b.toString().localeCompare(a.toString()) : -1;
        }
    };
}

function sortDate(sortOrder) {
    return sortNumeric(sortOrder);
}

function sortNumeric(sortOrder) {
    return function (a, b) {
        if (sortOrder >= 0) {
            return !_.isUndefined(a) ? a - b : 1;
        } else {
            return !_.isUndefined(b) ? b - a : -1;
        }
    };
}

function sortAlpha(sortOrder) {
    return function (a, b) {
        if (sortOrder >= 0) {
            return !_.isUndefined(a) ? a.localeCompare(b) : 1;
        } else {
            return !_.isUndefined(b) ? b.localeCompare(a) : -1;
        }
    };
}