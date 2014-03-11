'use strict';

var logger = require('../Logger');
var _ = require('lodash');
/**
 * Implementation of $addToSet
 * @see http://docs.mongodb.org/manual/reference/operator/update/addToSet/
 */
module.exports = function  addToSetOperation(model, update, options) {
    _.forIn(update, function (value, key) {
        if(_.isObject(value) && value.$each){
            var obj = {};
            obj[key] = value.$each;
            addToSetOperation(model, obj, options);
        }else{
            var original = model[key];
            if (_.isArray(original)) {
                if (!_.isArray(value)) {
                    value = [value];
                }
                model[key] = _.union(original, value);
            } else {
                logger.warn('$addToSet model value not an array', key);
            }
        }
    });
};