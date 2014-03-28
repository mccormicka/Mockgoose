'use strict';

var _ = require('lodash');
var push = require('./PushOperation');
/**
 * Implemenation of $pushAll
 * @see http://docs.mongodb.org/manual/reference/operator/update/pushAll/
 */
module.exports = function pushAllOperation(model, updates, options) {
    _.forIn(updates, function (value, key) {
        _.forEach(value, function(item){
            var update = {};
            update[key] = item;
            push(model, update, options);
        });
    });
};