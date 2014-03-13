'use strict';
var _ = require('lodash');
var operations = require('./operations/Operations');

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
module.exports.findProperty = findProperty;
module.exports.contains = contains;
module.exports.isNestedKey = isNestedKey;
module.exports.findNestedValue = findNestedValue;


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

function matchObjectParams(query, q, item) {
    var result = false;
    if (typeof query[q] === 'object') {
        if(operations.isOperation(q)){
            result = operations.getOperation(q)(result || item, query, {query:query, queryItem:q});
        }else{
            _.each(_.keys(query[q]), function(key){
                if(operations.isOperation(key)){
                    result = operations.getOperation(key)(result || item, query[q], {query:query, queryItem:q});
                }else if(operations.isOperation(query[q][key])){
                    result = operations.getOperation(query[q][key])(result || item, query[q][key], {query:query, queryItem:key});
                }else if (item[q] && query[q]) {
                    if (item[q].toString() === query[q].toString()) {
                        result = true;
                    }
                }
            });
        }
    }
    return result;
}

function matchArrayParams(items, queryItem, query, q){
    if(_.isArray(items)){
        return _.any(items, function(item){
            return matchItems(item, queryItem, query, q, item);
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

function isNestedKey(key){
    return key.split('.').length > 1;
}

function findNestedValue(model, key){
    return findValue(key, model);
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
        } else if(_.isArray(obj)){
            var values  = _.pluck(obj, objPath[k+1]);
            if(!_.isUndefined(values[0])){
                value = values;
                break;
            }
        }
    }
    return value;
}

function findProperty(item, q){
    var values = q.split('.');
    var value = item;
    _.each(values, function(prop){
        value = value[prop];
    });
    return value;
}