'use strict';

var _ = require('lodash');
var utils = require('../../utils');
var ObjectId = require('mongoose').Types.ObjectId;

/**
 * Implmentation of $in
 * @see http://docs.mongodb.org/manual/reference/operator/query/in/
 */
module.exports = function  operation(model, update, options) {
    var result = false;
    var modelValue = utils.findProperty(model, options.queryItem);
    if (!_.isUndefined(modelValue)) {
        if (!_.isArray(modelValue)) {
            modelValue = [modelValue];
        }
        result = !!_.find(update.$in, function (value) {
            if (value instanceof ObjectId) {
                value = value.toString();
                modelValue = _.map(modelValue, function (x) { 
                    return x instanceof ObjectId ? x.toString() : x; 
                });
            }
            return _.contains(modelValue, value);
        });
    }
    return result;
};
