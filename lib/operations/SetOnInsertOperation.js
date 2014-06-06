'use strict';

var _ = require('lodash');
var positional = require('./UpdatePositionalOperator');
var utils = require('../utils');

/**
 * Implementtion of $set
 * @see http://docs.mongodb.org/manual/reference/operator/update/set/
 */
module.exports = function setOnInsertOperation(model, update, options) {
    if (options.insert) {
        _.forIn(update, function (value, key) {
            var updatedValues = {};
            updatedValues[key] = value;
            if (!positional(model, updatedValues, options)) {
                if (utils.isNestedKey(key)) {
                    utils.setNestedValue(model, key, value);
                } else {
                    model[key] = value;
                }
            }
        });
    }
};
