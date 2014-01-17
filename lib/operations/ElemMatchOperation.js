'use strict';

var _ = require('lodash');
var operations = require('./Operations');

/*jshint -W098 *///options
module.exports = function operation(model, update, options) {
    var result = _.find(model[options.queryItem] || [model], function (item) {
        return _.every(_.keys(update.$elemMatch), function (key) {
            var value = update.$elemMatch[key];
            if(operations.isOperation(value)){
                return operations.getOperation(value)(item, value, {queryItem:key});
            }
            var equal = _.isEqual(item[key], value);
            return equal;
        });
    });

    return result;
};
