'use strict';
/*jshint -W098 *///options
var _ = require('lodash');
/**
 * Implementation of $inc
 * @see http://docs.mongodb.org/manual/reference/operator/update/inc/
 */
module.exports = function  incOperation(model, update, options) {
    _.forIn(update, function (value, key) {
        model[key] += value;
    });
};