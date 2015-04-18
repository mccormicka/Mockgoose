'use strict';

/*jshint -W098 *///options
var _ = require('lodash');
var operations = require('./../Operations');
/**
 * Implementation of $and
 * @see http://docs.mongodb.org/manual/reference/operator/query/and/
 */
module.exports = function operation(model, update, options) {
    var results = _.every(update.$and, function (value) {
        var valid = true;
        _.forIn(value, function (item, key, elem) {
            if (operations.isOperation(elem)) {
                valid = value && operations.getOperation(key)(model, elem, {queryItem: key});
            }else if (operations.isOperation(item)) {
                valid = valid && operations.getOperation(item)(model, value[key], {queryItem: key});
            } else {
                if (_.isArray(model[key])) {
                    valid = valid && _.some(model[key], function(v) { return _.isEqual(v, item); });
                } else {
                    valid = valid && _.isEqual(model[key], item);
                }
            }
        });
        return valid;
    });
    return results;
};
