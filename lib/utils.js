'use strict';
var _ = require('lodash');
var ObjectId = require('./Types').ObjectId;
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
module.exports.isNestedKey = isNestedKey;
module.exports.findNestedValue = findNestedValue;
module.exports.setNestedValue = setNestedValue;
module.exports.isRegExp = isRegExp;
module.exports.ConnectionError = ConnectionError;

//-------------------------------------------------------------------------
//
// Private Methods
//
//-------------------------------------------------------------------------

function ConnectionError() {
    var err = new Error('mock: connect failed');
    err.name = 'MongoError';
    err.code = 13328;
    return err;
}

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

function valuesAreObjectIds(item, value) {
    return (item instanceof ObjectId && value instanceof ObjectId);
}

function matchValues(item, value) {
    if(valuesAreObjectIds(item, value)){
        return item.equals(value);
    }
    return _.isEqual(item, value);
}

function resultObject(result, item) {
    return !_.isEmpty(result) ? result : item;
}

function matchObjectParams(query, q, item) {
    var result = false;
    var queryValue = query[q];
    if (typeof queryValue === 'object') {
        if (queryValue instanceof Date) {
           result = item[q] instanceof Date && queryValue.getTime() === item[q].getTime();
        }
        else if (isRegExp(query[q])) {
            result = operations.getOperation('$regex')(resultObject(result, item), {$regex: query[q]}, {query: query, queryItem: q});
        }
        else if (operations.isOperation(q)) {
            result = operations.getOperation(q)(resultObject(result, item), query, {query: query, queryItem: q});
        } else {
            result = nestedValuesMatch(result, queryValue, item, query, q);
        }
    }
    return result;
}

function matchArrayParams(items, queryItem, query, q) {
    if (_.isArray(items)) {
        return _.any(items, function (item) {
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
    return _.cloneDeep(item, function(value) {
        // Do not clone items that are ObjectId objects as _.clone mangles them
        if (value instanceof ObjectId) {
            return new ObjectId(value.toString());
        }
    });
}

function isNestedKey(key) {
    return key.split('.').length > 1;
}

function findNestedValue(model, key) {
    return findValue(key, model);
}
function setNestedValue(model, objectPath, value) {
    var objPath = objectPath.split('.');
    //Find our value.
    var modelItem = model[objectPath];
    for (var k = 0; k < objPath.length - 1; k++) {
        modelItem = model[objPath[k]];
        model = modelItem;
        if (_.isUndefined(model)) {
            break;
        } else if (_.isArray(model)) {
            var values = _.pluck(model, objPath[k + 1]);
            if (!_.isUndefined(values[0])) {
                modelItem = values;
                break;
            }
        }
    }
    modelItem[objPath[objPath.length - 1]] = value;
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
        } else if (_.isArray(obj)) {
            var key = objPath[k + 1];
            //Support Positional operation
            //http://docs.mongodb.org/manual/reference/operator/update/positional/
            if( key === '$' ){
                obj = obj[0];
                k++;
                continue;
            }
            var values = _.pluck(obj, key);
            if (!_.isUndefined(values[0])) {
                value = values;
                break;
            }
        }
    }
    return value;
}

function findProperty(item, q) {
    var values = q.split('.');
    var value = item;
    _.each(values, function (prop) {
        value = value[prop];
    });
    return value;
}

function isRegExp(value) {
    return value && _.isFunction(value.test);
}

function nestedValuesMatch(result, queryValue, item, query, q) {
    return _.every(_.keys(queryValue), function (key) {
        if (operations.isOperation(key)) {
            return operations.getOperation(key)(
                resultObject(result, item),
                query[q],
                {query: query, queryItem: q}
            );
        } else if (operations.isOperation(query[q][key])) {
            return operations.getOperation(query[q][key])(
                resultObject(result, item),
                query[q][key],
                {query: query, queryItem: key}
            );
        } else if (item[q] && query[q]) {
            return item[q].toString() === query[q].toString();
        } else {
            return false;
        }
    });
}
