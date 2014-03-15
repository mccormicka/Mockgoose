'use strict';

var utils = require('../../utils');
/**
 * Implementation of $regex
 * @see http://docs.mongodb.org/manual/reference/operator/query/regex/
 */
module.exports = function operation(model, update, options) {
    var key = options.queryItem;
    var test = model[key];
    if (utils.isNestedKey(key)) {
        test = utils.findNestedValue(model, key);
    }
    return new RegExp(update.$regex, update.$options).test(test);
};
