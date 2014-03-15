'use strict';

var _ = require('lodash');
var operations = require('./../Operations');
var utils = require('../../utils');

/**
 * Implementation of $not
 * @see http://docs.mongodb.org/manual/reference/operator/query/not/
 */
module.exports = function operation(model, update, options) {
    var valid = false;
    var value = update.$not;
    if(utils.isRegExp(value)){
        value = {
            '$regex' : value
        };
    }
    _.forIn(value, function (item, key) {
        if (operations.isOperation(key)) {
            var opt = {};
            opt[key] = item;
            valid = !operations.getOperation(key)(model, opt, options);
        } else if (utils.isNestedKey(key)) {
            valid = !_.isEqual(utils.findNestedValue(model, key), item);
        }
        else {
            valid = !_.isEqual(model[key], item);
        }
    });
    return valid;
};
