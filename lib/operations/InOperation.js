'use strict';

var _ = require('lodash');
var utils = require('../utils');
/**
 * Implmentation of $in
 * @see http://docs.mongodb.org/manual/reference/operator/query/in/
 */
module.exports = function  inOperation(model, update, options) {
    var modelValue = utils.findProperty(model, options.queryItem);
    var contains = utils.contains;
    return !!_.find(update.$in, function (value) {
        if(contains(modelValue, value)){
            return true;
        }
        return false;
    });

};