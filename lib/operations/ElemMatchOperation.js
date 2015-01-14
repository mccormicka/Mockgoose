'use strict';

var _ = require('lodash');
var operations = require('./Operations');

/**
 * Implementation of $elemMatch
 * @see http://docs.mongodb.org/manual/reference/operator/query/and/
 */
module.exports = function operation(model, update, options) {
    var result = _.find(model[options.queryItem] || [model], function (item) {
        return _.every(_.keys(update.$elemMatch), function (key) {
            var value = update.$elemMatch[key];
            if (operations.isOperation(key)) {
                var m = item;

                // Most operations aren't implemented to handle non-Object values, so convert
                // them to an Object where the actual value is keyed under queryItem
                if (!_.isObject(m)) {
                    m = {};
                    m[options.queryItem] = item;
                }

                return operations.getOperation(key)(m, _.pick(update.$elemMatch, key), options);
            } else if (operations.isOperation(value)){
                return operations.getOperation(value)(item, value, {queryItem:key});
            }
            var equal = _.isEqual(item[key], value);
            return equal;
        });
    });

    return result;
};
