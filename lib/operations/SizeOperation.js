'use strict';

var _ = require('lodash');

/**
 * Implementation of $size
 * @see http://docs.mongodb.org/manual/reference/operator/query/size/
 */
module.exports = function operation(model, update, options) {
    return _.isArray(model[options.queryItem]) && _.isEqual(model[options.queryItem].length, update.$size);
};
