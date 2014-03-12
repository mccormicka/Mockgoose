'use strict';

var _ = require('lodash');
var utils = require('../../utils');
/**
 * Implementation of $nin
 * @see http://docs.mongodb.org/manual/reference/operator/query/nin/
 */
module.exports = function operation(model, update, options) {
    if (_.isObject(model)) {
        var modelValue = utils.findProperty(model, options.queryItem);
        if (_.isUndefined(modelValue)) {
            return true;
        }
        if(!_.isArray(modelValue)){
            modelValue = [modelValue];
        }
        var result = _.find(update.$nin, function (value) {
            if (_.contains(modelValue, value)) {
                return true;
            }
            return false;
        });
        return _.isUndefined(result);
    }
    return false;
};