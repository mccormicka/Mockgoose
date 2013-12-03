'use strict';

var _ = require('lodash');
var push = require('./PushOperation');
/*jshint -W098 *///options
module.exports = function pushAllOperation(model, updates, options) {
    _.forIn(updates, function (value, key) {
        _.forEach(value, function(item){
            var update = {};
            update[key] = item;
            push(model, update, options);
        });
    });
};