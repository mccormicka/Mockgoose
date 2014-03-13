'use strict';

var _ = require('lodash');

/**
 * Implementation of Positional values $
 * @see http://docs.mongodb.org/manual/reference/operator/update/positional/
 */
module.exports = function operation(model, update, options) {
    var updated = false;
    _.forIn(update, function (value, key) {
        if (isPositionalValueField(key)) {
            updated = updatePositionalValueField(model, options.conditions, key, value);
        } else if (isPositionalValue(key)) {
            updated = updatePositionalValue(model, options.conditions, key, value);
        }
    });
    return updated;
};

//-------------------------------------------------------------------------
//
// Private Methods
//
//-------------------------------------------------------------------------

function isPositionalValue(key) {
    return key.indexOf('.$') !== -1;
}

function isPositionalValueField(key) {
    return key.indexOf('.$.') !== -1;
}

function createUpdateModelOptions(arrayKeys, condition, positionalArray, value) {
    var conditionKey = findConditionKey(arrayKeys, condition);
    var modelOriginalValue = condition[conditionKey];
    var nestedPropertyKey = findNestedPropertyKey(conditionKey);
    var options = {
        positionalArray: positionalArray,
        nestedPropertyKey: nestedPropertyKey,
        modelOriginalValue: modelOriginalValue,
        arrayKeys: arrayKeys,
        value: value
    };
    return options;
}

function updatePositionalValue(model, condition, key, value) {
    var arrayKey = key.slice(0, key.indexOf('.$'));
    var positionalArray = model[arrayKey];
    if (!_.isUndefined(condition) && _.isArray(positionalArray)) {
        var originalValue = condition[arrayKey];
        var length = positionalArray.length;
        for (var i = 0; i < length; i++) {
            if (_.isEqual(originalValue, positionalArray[i])) {
                positionalArray.splice(i, 1, value);
                return true;
            }
        }
    }
    return false;
}

function updatePositionalValueField(model, condition, key, value) {
    var arrayKeys = stripKeySeparators(key.split('$'));
    var positionalArray = model[arrayKeys[0]];
    if (!_.isUndefined(condition) && _.isArray(positionalArray)) {
        var options = createUpdateModelOptions(arrayKeys, condition, positionalArray, value);
        var length = positionalArray.length;
        for (var position = 0; position < length; position++) {
            if (updateModelValue(position, options)) {
                return true;
            }
        }
    }
    return false;
}

function findConditionKey(arrayKeys, condition) {
    var conditionKey = arrayKeys[0];
    _.forIn(condition, function (value, key) {
        if (key.indexOf(arrayKeys[0]) > -1) {
            conditionKey = key;
            return false;
        }
        return true;
    });
    return conditionKey;
}

function stripKeySeparators(keys) {
    var strippedKeys = [];
    _.forEach(keys, function (key) {
        strippedKeys.push(key.replace('.', ''));
    });
    return strippedKeys;
}

function findNestedPropertyKey(conditionKey) {
    var childPropertyArray = conditionKey.split('.');
    return childPropertyArray[childPropertyArray.length - 1];
}

function updateModelValue(position, options) {
    var positionalArray = options.positionalArray;
    var nestedPropertyKey = options.nestedPropertyKey;
    var modelOriginalValue = options.modelOriginalValue;
    var arrayKeys = options.arrayKeys;
    var value = options.value;
    var child = positionalArray[position];
    var childValue = child;
    if (_.isObject(child)) {
        childValue = child[nestedPropertyKey];
    }
    if (_.isEqual(modelOriginalValue, childValue)) {
        if (_.isObject(child)) {
            child[arrayKeys[arrayKeys.length - 1]] = value;
        } else {
            positionalArray.splice(position, 1, value);
        }
        return true;
    }
    return false;
}