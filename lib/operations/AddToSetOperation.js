'use strict';

var logger = require('nodelogger').Logger(__filename);
var _ = require('lodash');
/*jshint -W098 *///options
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