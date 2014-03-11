'use strict';

var _ = require('lodash');
/**
 * Implementation of $ne
 * @see http://docs.mongodb.org/manual/reference/operator/query/ne/
 */
module.exports = function  operation(model, update, options) {
    return !_.isEqual(model[options.queryItem], update.$ne);
};