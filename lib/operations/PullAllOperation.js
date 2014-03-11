'use strict';

var _ = require('lodash');
var pull = require('./PullOperation');
/**
 * Implementation of $pullAll
 * @see http://docs.mongodb.org/manual/reference/operator/update/pullAll/
 */
module.exports = function pullAllOperation(model, updates, options) {
    _.forIn(updates, function (value, key) {
        _.forEach(value, function(item){
            var update = {};
            update[key] = item;
            pull(model, update, options);
        });
    });
};