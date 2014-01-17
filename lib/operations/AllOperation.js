'use strict';

var _ = require('lodash');
var operations = require('./Operations');

/*jshint -W098 *///options
module.exports = function operation(model, update, options) {
    var results = _.every(update.$all, function (value) {
        if(value.$elemMatch){
            return operations.getOperation('$elemMatch')(model, value, options);
        }
        return _.contains(model[options.queryItem], value);
    });
    return results;
};
