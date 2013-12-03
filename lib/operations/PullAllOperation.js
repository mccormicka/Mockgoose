'use strict';

var _ = require('lodash');
var pull = require('./PullOperation');
/*jshint -W098 *///options
module.exports = function pullAllOperation(model, updates, options) {
    _.forIn(updates, function (value, key) {
        _.forEach(value, function(item){
            var update = {};
            update[key] = item;
            pull(model, update, options);
        });
    });
};