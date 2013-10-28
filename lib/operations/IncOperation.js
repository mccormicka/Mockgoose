'use strict';

var _ = require('lodash');
/*jshint -W098 *///options
module.exports = function  incOperation(model, update, options) {
    _.forIn(update, function (value, key) {
        model[key] += value;
    });
};