'use strict';

var logger = require('../Logger');
var _ = require('lodash');

var operations = {
    '$pull': require('./PullOperation'),
    '$pullAll': require('./PullAllOperation'),
    '$push': require('./PushOperation'),
    '$pushAll': require('./PushAllOperation'),
    '$set': require('./SetOperation'),
    '$inc': require('./IncOperation'),
    '$addToSet' : require('./AddToSetOperation'),
    '$in' : require('./InOperation'),
    '$ne' : require('./NEOperation'),
    '$elemMatch' : require('./ElemMatchOperation'),
    '$all' : require('./AllOperation'),
    '$gt' : require('./GreaterThanOperation')
};

module.exports.isOperation = function(value){
    value = module.exports.getOperationFromObject(value);
    return !!operations[value];
};

module.exports.getOperationFromObject = function(value){
    if(_.isObject(value)){
        return _.find(_.keys(operations), function(operation){
            return value[operation];
        });
    }
    return value;
};

module.exports.getOperation  = function getOperation(type){
    var operation = module.exports.getOperationFromObject(type);
    if(!operations[operation]){
        logger.error('Mockgoose currently does not support the ' + operation + ' operation' );
        return false;
    }
    return operations[operation];
};