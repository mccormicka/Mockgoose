'use strict';

/*jshint -W098 *///options

var utils = require('../utils');
var _ = require('lodash');
/**
 * Implementation of $pull
 * @see http://docs.mongodb.org/manual/reference/operator/update/pull/
 */
module.exports = function pullOperation(model, update, options) {
    pullItems(model, update);
};

//-------------------------------------------------------------------------
//
// Private Methods
//
//-------------------------------------------------------------------------

function pullItems(model, pulls) {
    for (var pull in pulls) {
        if (pulls.hasOwnProperty(pull)) {
            var values = model[pull];
            if (utils.isNestedKey(pull)) {
                values = utils.findNestedValue(model, pull);
            }
            var match = utils.findMatch(values, pulls[pull]);
            if (match.length > 0) {
                pullItem(match, values);
            }
        }
    }
}

function pullItem(match, values) {
    for (var i in match) {
        if (match.hasOwnProperty(i)) {
            var index = indexOf(values, match[i]);
            if (index > -1) {
                values.splice(index, 1);
            }
        }
    }
}

function indexOf(values, match) {
    var index = -1;
    var foundItem = _.find(values, function (value) {
        index++;
        return deepEquals(value, match);
    });
    if (foundItem) {
        return index;
    }
    return -1;
}

/**
 * Implementation from
 * http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
 */
function deepEquals(x, y) {
    if (x === y) {
        return true;
    }
    // if both x and y are null or undefined and exactly the same

    if (!( x instanceof Object ) || !( y instanceof Object )) {
        return false;

    }
    // if they are not strictly equal, they both need to be Objects

    if (x.constructor !== y.constructor) {
        return false;
    }
    // they must have the exact same prototype chain, the closest we can do is
    // test there constructor.

    for (var p in x) {
        if (!x.hasOwnProperty(p)) {
            continue;
        }
        // other properties were tested using x.constructor === y.constructor

        if (!y.hasOwnProperty(p)) {
            return false;
        }
        // allows to compare x[ p ] and y[ p ] when set to undefined

        if (x[ p ] === y[ p ]) {
            continue;
        }
        // if they have the same strict value or identity then they are equal

        if (typeof( x[ p ] ) !== 'object') {
            return false;
        }
        // Numbers, Strings, Functions, Booleans must be strictly equal

        if (!deepEquals(x[ p ], y[ p ])) {
            return false;
        }
        // Objects and Arrays must be tested recursively
    }

    for (p in y) {
        if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
            return false;
        }
        // allows x[ p ] to be set to undefined
    }
    return true;
}