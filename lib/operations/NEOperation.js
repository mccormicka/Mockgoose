'use strict';

var _ = require('lodash');
var inOperation = require('./InOperation');
/*jshint -W098 *///options
module.exports = function  operation(model, update, options) {
    var updateClone = _.defaults({}, update);
    delete updateClone.$ne;
    updateClone.$in = [update.$ne];
    return !inOperation(model , updateClone, options);
};