'use strict';

var _ = require('lodash');
var utils = require('../../utils');
var ObjectId = require('../../Types').ObjectId;
/**
 * Implementation of $nin
 * @see http://docs.mongodb.org/manual/reference/operator/query/nin/
 */
module.exports = function operation(model, update, options) {
    var result = false;
    if (_.isObject(model)) {
        result = doesNotHaveValue(model, options, update);
    }
    return result;
};

function doesNotHaveValue(model, options, update) {
    var result = true;
    var modelValue = utils.findProperty(model, options.queryItem);
    if (!_.isUndefined(modelValue)) {
        if (!_.isArray(modelValue)) {
            modelValue = [modelValue];
        }
        result = _.isUndefined(_.find(update.$nin, function (value) {
            if (value instanceof ObjectId) {
                return _.some(modelValue, function(valueToCheck) {
                    return value.equals(valueToCheck);
                });
            }
            return _.contains(modelValue, value);

        }));
    }
    return result;
}