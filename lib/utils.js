'use strict';
var logger = require('nodelogger').Logger(__filename);
var _ = require('lodash');
module.exports.isEmpty = _.isEmpty;
module.exports.objectToArray = objectToArray;
module.exports.cloneItems = cloneItems;
module.exports.cloneItem = cloneItem;
module.exports.matchParams = matchParams;
module.exports.allParamsMatch = allParamsMatch;
module.exports.matchParams = matchParams;
module.exports.allParamsMatch = allParamsMatch;
module.exports.buildResults = buildResults;
module.exports.findMatch = findMatch;
module.exports.foundModel = foundModel;
module.exports.findModelQuery = findModelQuery;

//-------------------------------------------------------------------------
//
// Private Methods
//
//-------------------------------------------------------------------------

function findModelQuery(items, query) {
    return findMatch(items, query);
}
function findMatch(items, query) {
    var results = {};
    for (var key in items) {
        if (items.hasOwnProperty(key)) {
            for (var q in query) {
                buildResults(query, q, items, key, results);
            }
        }
    }
    return objectToArray(cloneItems(results));
}

/**
 * Creates a new instance from the model so that
 * if the original is updated but not saved it is
 * not manipulated in the database.
 * @param item
 * @returns {item.mockModel}
 */
function cloneItem(item) {
    if (item.mockModel) {
        return new item.mockModel(item);
    } else {
        logger.warn('Returning actual model this may be mutated!');
        return item;
    }
}

function buildResults(query, q, items, key, results) {
    if (query.hasOwnProperty(q)) {
        var item = foundModel(items[key], query, q);
        if (item) {
            if (item._id) {
                results[item._id] = item;
            } else {
                results[Math.random()] = item;
            }
        }
    }
}

function foundModel(item, query, q) {
    if (matchParams(item, query, q)) {
        var allMatch = allParamsMatch(query, item);
        if (allMatch) {
            return item;//return cloneItem(item);
        }
    }
    return false;
}

function allParamsMatch(query, item) {
    var allMatch = true;
    for (var qq in query) {
        if (query.hasOwnProperty(qq)) {
            if (!matchParams(item, query, qq)) {
                allMatch = false;
                break;
            }
        }
    }
    return allMatch;
}

function matchParams(item, query, q) {
    var result = matchStringParams(item, q, query, result);
    if (!result) {
        result = matchObjectParams(query, q, item);
    }
    if (!result) {
        result = matchBooleanParams(item, q, query);
    }
    return result;
}


function contains(obj, target) {
    if (!obj) {
        return false;
    }
    return obj.indexOf(target) !== -1;
}

function matchStringParams(item, q, query) {
    if (typeof item[q] === 'string') {
        if (item[q] && query[q]) {
            if (item[q].toString() === query[q].toString()) {
                return true;
            }
        }
    }
    return false;
}
function matchedObjectContains(query, q, item) {
    var result = false;
    for (var i in query[q].$in) {
        if (contains(item[q], query[q].$in[i])) {
            result = true;
            break;
        }
    }
    return result;
}
function matchObjectParams(query, q, item) {
    var result = false;
    if (typeof query[q] === 'object') {
        if (query[q].$in) {
            result = matchedObjectContains(query, q, item);
        }
    }
    return result;
}

function matchBooleanParams(item, q, query) {
    if (typeof item[q] === 'boolean') {
        return item[q] === query[q];
    }
}

function allParamsMatch(query, item) {
    var allMatch = true;
    for (var qq in query) {
        if (query.hasOwnProperty(qq)) {
            if (!matchParams(item, query, qq)) {
                allMatch = false;
                break;
            }
        }
    }
    return allMatch;
}

function matchParams(item, query, q) {
    var result = matchStringParams(item, q, query, result);
    if (!result) {
        result = matchNumberParams(query, q, item);
    }
    if (!result) {
        result = matchObjectParams(query, q, item);
    }
    if (!result) {
        result = matchBooleanParams(item, q, query);
    }
    return result;
}

function matchStringParams(item, q, query) {
    if (typeof item[q] === 'string') {
        if (item[q] && query[q]) {
            if (item[q].toString() === query[q].toString()) {
                return true;
            }
        }
    }
    return false;
}
function matchNumberParams(item, q, query) {
    if (typeof item[q] === 'number') {
        if (item[q] && query[q]) {
            if (item[q] === query[q]) {
                return true;
            }
        }
    }
    return false;
}
function matchedObjectContains(query, q, item) {
    var result = false;
    for (var i in query[q].$in) {
        if (contains(item[q], query[q].$in[i])) {
            result = true;
            break;
        }
    }
    return result;
}

function matchObjectParams(query, q, item) {
    var result = false;
    if (typeof query[q] === 'object') {
        if (query[q].$in) {
            result = matchedObjectContains(query, q, item);
        }
    }
    return result;
}

function matchBooleanParams(item, q, query) {
    if (typeof item[q] === 'boolean') {
        return item[q] === query[q];
    }
}

function objectToArray(items) {
    var results = [];
    for (var model in items) {
        results.push(items[model]);
    }
    return results;
}

function cloneItems(items) {
    var clones = {};
    for (var item in items) {
        clones[item] = cloneItem(items[item]);
    }
    return clones;
}

function cloneItem(item) {
    if (item.mockModel) {
        return new item.mockModel(item);
    } else {
        logger.warn('Returning actual model this may be mutated!');
        return item;
    }
}