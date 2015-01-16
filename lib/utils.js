'use strict';
var _ = require('lodash');
var ObjectId = require('mongoose').Types.ObjectId;
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
    if(isNestedKey(q)) {
        var tmpQueryValues = convertDotNotationKeyToObject(q, query);

        q = tmpQueryValues.q;
        query = tmpQueryValues.query;
    }

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
    var result = false;

    // Identified condition where when the operation is "$ne", this method
    // is returning true and causing the NEOperation module to never be
    // invoked for check.
    if(_.first(_.keys(query[q])) !== '$ne') {
        result = matchValues(value, queryItem);
    }

    if (!result) {
        result = matchObjectParams(query, q, item);
    }

    if (!result) {
        result = matchArrayParams(value, queryItem, query, q, item);
    }

    return result;
}

function matchParams(item, query, q) {
    // If query is an object, then build object path. findValue() does not have
    // knowledge of the query so we must build object path from a nested object
    // and handed it off to that method.
    var objectPath = q,
        queryItem = query[q],
        objRef = query[q];

    if(_.isObject(query) && !(objRef instanceof ObjectId)) {
        var objPath = [q],
            key;

        // Loop through nested object to build an array of keys that will
        // serve as the objectPath in the findValue() method.
        //
        // For example:
        //
        // { qty: { num: 4 }} -> ['qty', 'num']
        //
        // Notice -- This is the quivalent of 'qty.num'.split('.')
        //
        while(_.isObject(objRef) && !(objRef instanceof ObjectId)) {
            key = _.first(_.keys(objRef));

            objPath.push(key);
            objRef = objRef[key];
        }

        // Only reassign the queryItem value to the last object reference
        // if that reference is truthy and true
        if(objRef) {
            queryItem = objRef;
        }

        // Update the object path with array constructed by traversing nested
        // object of keys.
        //
        // If the last key in the nested object is an operation i.e. $exists,
        // don't reassign the objectPath as there are considerations for
        // operations further down the processing change.
        if(!operations.isOperation(key)) {
            objectPath = objPath;
        }
    }

    var value = findValue(objectPath, item);

    var result = matchItems(value, queryItem, query, q, item);

    return result;
}

function valuesAreObjectIds(item, value) {
    if(item && value){
        return _.isFunction(item.equals) && _.isFunction(value.equals);
    }
    return false;
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
        if (isRegExp(query[q])) {
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
    // Do not clone items that are ObjectId objects as _.clone() mangles them
    if(item instanceof ObjectId) {
        return item;
    }

    return _.clone(item);
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
    // If objectPath is received as string, use split to conver it to an array
    // otherwise, it should be an array.
    var objPath = _.isString(objectPath) ? objectPath.split('.') : objectPath;

    var value = objectPath;
    for (var k = 0; k < objPath.length; k++) {
        value = obj !== null ? obj[objPath[k]] : null;
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

/**
 * If foundModel() receives a lookup path in dot notation, it will convert
 * that to a nested object format.  This keeps operations after this point
 * operating on a standard lookup format.
 *
 * Example:
 *
 * {"qty.sum": {$gte: 10}}
 *
 * becomes
 *
 * {qty: {sum: {$gte: 10}}}
 *
 * when called:
 *
 * convertDotNotationKeyToObject("qty.sum", {$gte: 10})
 *
 * @param  {String} key   Dot notation string to convert
 * @param  {Object} query The original query value that will be merged with conversion result
 * @return {Object}       Values converted to nested object with new q and query values
 */
function convertDotNotationKeyToObject(key, query) {
        /**
         * Final value for assignment to deepest key
         * @type {Mixed}
         */
    var value = query[key],

        /**
         * Dot notation string converted to array
         *
         * @type {Array}
         */
        values = key.split('.'),

        /**
         * Object to build
         *
         * @type {Object}
         */
        obj = {},

        /**
         * Store reference ot last created object for next iteration
         */
        lastObjRef;

    for(var i = 0; i < values.length; i++) {
        if(_.isEmpty(obj)) {
            obj[values[i]] = lastObjRef = {};
        } else if(i + 1 < values.length) {
            lastObjRef[values[i]] = lastObjRef = {};
        } else {
            lastObjRef[values[i]] = value || {};
        }
    }

    // Retain query value by merging in original query
    obj = _.merge(query, obj);

    // Delete dot notation key that was converted to object
    delete obj[key];

    /**
     * Throughout util lib, q is first key in object and query is the complete
     * criteria for looking up a value in the item
     *
     * @type {Object}
     */
    return {q: _.first(values), query: obj};
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
            /**
             * Initialize the item to hand off to the operation module with the
             * plain item value.
             *
             * @type {Object}
             */
            var itemToEvaluate = item;

            // If the item does not have the key value as a property and has
            // the q as a property, itemToEvaluate becomes equal to the item's
            // value at q.  This was added to fix issue where nested object that
            // was only two levels deep was not properly being accessed.
            if(!itemToEvaluate.hasOwnProperty(key) &&
               itemToEvaluate.hasOwnProperty(q)) {
                    itemToEvaluate = item[q];
            }

            return operations.getOperation(query[q][key])(
                resultObject(result, itemToEvaluate),
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
