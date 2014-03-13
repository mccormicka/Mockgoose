'use strict';

var _ = require('lodash');
var utils = require('../../utils');
/**
 * Implmentation of $in
 * @see http://docs.mongodb.org/manual/reference/operator/query/in/
 */
module.exports = function  operation(model, update, options) {
    var result = false;
    var modelValue = utils.findProperty(model, options.queryItem);
    var contains = utils.contains;
    if (!_.isUndefined(modelValue)) {
        if (!_.isArray(modelValue)) {
            modelValue = [modelValue];
        }
        result = !!_.find(update.$in, function (value) {
            if(contains(modelValue, value)){
                return true;
            }
            return false;
        });
    }
    return result;
};