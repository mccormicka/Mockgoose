'use strict';

var _ = require('lodash');
var models = {};
module.exports = models;

module.exports.reset = reset;

function reset(type) {
    if (!type) {
        _.map(models, function(value, key){
            if(key !== 'reset'){
                delete models[key];
            }
        });
    } else {
        delete models[type.toLowerCase()+'s'];
    }
    return true;
}