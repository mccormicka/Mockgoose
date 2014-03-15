'use strict';

var utils = require('../utils');
/**
 * Performs regex tests
 */
module.exports = function operation(model, update, options) {
    var key = options.queryItem;
    var test = model[key];
    if (utils.isNestedKey(key)) {
        test = utils.findNestedValue(model, key);
    }
    return update.$regExp.test(test);
};
