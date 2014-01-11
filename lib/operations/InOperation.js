'use strict';

var _ = require('lodash');
var utils = require('../utils');
/*jshint -W098 *///options
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