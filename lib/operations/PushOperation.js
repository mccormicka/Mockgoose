'use strict';
/*jshint -W098 *///options
var _ = require('lodash');
var utils = require('../utils');

/**
 * Implementation of $push
 * @see http://docs.mongodb.org/manual/reference/operator/update/push/
 */
module.exports = function pushOperation(model, update, options) {
    _.forIn(update, function (value, key) {
        var temp = [];
        if(utils.isNestedKey(key)){
            temp = utils.findNestedValue(model, key);
        }
        else if (model[key]) {
            temp = model[key];
        }
        var updates = value;
        if (updates.$each) {
            _.each(updates.$each, function(item){
                temp.push(item);
            });
        } else {
            temp.push(updates);
        }
    });
};