'use strict';

/*jshint -W098 *///options
var _ = require('lodash');
var operations = require('./../Operations');
var utils = require('../../utils');

/**
 * Implementation of $nor
 * @see http://docs.mongodb.org/manual/reference/operator/query/nor/
 */
module.exports = function operation(model, update, options) {
    var results = _.every(update.$nor, function (value) {
        var valid = false;
        _.forIn(value, function (item, key) {
            if (operations.isOperation(item)) {
                valid = !operations.getOperation(item)(model, value[key], {queryItem: key});
            }else if(utils.isNestedKey(key)){
                valid = !_.isEqual(utils.findNestedValue(model, key), item);
            }
            else {
                valid = !_.isEqual(model[key], item);
            }
        });
        return valid;
    });
    return results;
};
