'use strict';
var _ = require('lodash');
module.exports.isEmpty = _.isEmpty;
module.exports.objectToArray = objectToArray;
module.exports.cloneItems = cloneItems;
module.exports.cloneItem = cloneItem;
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

function contains(obj, target) {
    if (!obj) {
        return false;
    }
    if (typeof obj === 'object') {
        obj = JSON.stringify(obj);
    }
    return obj.indexOf(target) !== -1;
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

function findValue(objectPath, obj) {
    var objPath = objectPath.split('.');
    //Find our value.
    var value = objectPath;
    for (var k = 0; k < objPath.length; k++) {
        value = obj[objPath[k]];
        obj = value;
        if (_.isUndefined(obj)) {
            break;
        }
    }
    return value;
}

function matchItems(value, queryItem, query, q, item) {
    var result = matchValues(value, queryItem);
    if (!result) {
        result = matchObjectParams(query, q, item);
    }
    if (!result) {
        result = matchArrayParams(value, queryItem, query, q, item);
    }
    return result;
}

function matchParams(item, query, q) {
    var value = findValue(q, item);
    var queryItem = query[q];
    var result = matchItems(value, queryItem, query, q, item);
    return result;
}

function matchValues(item, value) {
    return _.isEqual(item,value);
}

function matchedObjectContains(query, q, item) {
    var result = false;
    var value = findProperty(item, q);
    for (var i in query[q].$in) {
        if (contains(value, query[q].$in[i])) {
            result = true;
            break;
        }
    }
    return result;
}

function findProperty(item, q){
    var values = q.split('.');
    var value = item;
    _.each(values, function(prop){
        value = value[prop];
    });
    return value;
}

function matchObjectParams(query, q, item) {
    var result = false;
    if (typeof query[q] === 'object') {
        if (query[q].$in) {
            result = matchedObjectContains(query, q, item);
        } else if (item[q] && query[q]) {
            if (item[q].toString() === query[q].toString()) {
                result = true;
            }
        }
    }
    return result;
}

function matchArrayParams(items, queryItem, query, q, model){
    if(_.isArray(items)){
        return _.any(items, function(item){
            return matchItems(item, queryItem, query, q, model);
        });
    }
    return false;
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
    return _.clone(item);
}