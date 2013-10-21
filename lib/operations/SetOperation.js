'use strict';

var _ = require('lodash');

module.exports = function  setOperation(model, update, options) {
    _.forIn(update, function (value, key) {
        model[key] = value;
    });
};