'use strict';

var _ = require('lodash');
var operations = require('./Operations');
var ObjectId = require('mongoose').Types.ObjectId;
/**
 * Implementation of $all
 * @see http://docs.mongodb.org/manual/reference/operator/query/all/
 */
module.exports = function operation(model, update, options) {
    var results = _.every(update.$all, function (value) {
        if(value.$elemMatch){
            return operations.getOperation('$elemMatch')(model, value, options);
        } else if(value instanceof ObjectId) {
            return _.some(model[options.queryItem], function(valueToCheck) {
                return value.equals(valueToCheck);
            });
        }
        return _.contains(model[options.queryItem], value);
    });
    return results;
};
