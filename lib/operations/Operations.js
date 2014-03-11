'use strict';

var logger = require('../Logger');
var _ = require('lodash');

var operations = {
    '$addToSet' : require('./AddToSetOperation'),
    '$all' : require('./AllOperation'),
    '$and' : require('./AndOperation'),
    '$elemMatch' : require('./ElemMatchOperation'),
    '$exists' : require('./ExistsOperation'),
    '$gt' : require('./GreaterThanOperation'),
    '$gte' : require('./GreaterThanOrEqualOperation'),
    '$in' : require('./InOperation'),
    '$inc': require('./IncOperation'),
    '$lt' : require('./LessThanOperation'),
    '$lte' : require('./LessThanOrEqualOperation'),
    '$ne' : require('./NEOperation'),
    '$pull': require('./PullOperation'),
    '$pullAll': require('./PullAllOperation'),
    '$push': require('./PushOperation'),
    '$pushAll': require('./PushAllOperation'),
    '$set': require('./SetOperation'),
    '$unset' : require('./UnsetOperation')
};

module.exports.isOperation = function(value){
    value = module.exports.getOperationFromObject(value);
    return !!operations[value];
};

module.exports.getOperationFromObject = function(value){
    if(_.isObject(value)){
        return _.find(_.keys(operations), function(operation){
            return !_.isUndefined(value[operation]);
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