'use strict';

var _ = require('lodash');
var positional = require('./UpdatePositionalOperator');

module.exports = function setOperation(model, update, options) {
    _.forIn(update, function (value, key) {
        var updatedValues = {};
        updatedValues[key] = value;
        if(!positional(model, updatedValues, options)){
            model[key] = value;
        }
    });
};