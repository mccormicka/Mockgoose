'use strict';

var logger = require('../Logger');
var _ = require('lodash');

var operations = {
    '$addToSet' : require('./AddToSetOperation'),
    '$all' : require('./AllOperation'),
    '$and' : require('./logical/AndOperation'),
    '$elemMatch' : require('./ElemMatchOperation'),
    '$exists' : require('./ExistsOperation'),
    '$gt' : require('./comparison/GreaterThanOperation'),
    '$gte' : require('./comparison/GreaterThanOrEqualOperation'),
    '$in' : require('./comparison/InOperation'),
    '$inc': require('./IncOperation'),
    '$lt' : require('./comparison/LessThanOperation'),
    '$lte' : require('./comparison/LessThanOrEqualOperation'),
    '$ne' : require('./comparison/NEOperation'),
    '$nin' : require('./comparison/NINOperation'),
    '$nor' : require('./logical/NorOperation'),
    '$not' : require('./logical/NotOperation'),
    '$or' : require('./logical/OrOperation'),
    '$pull': require('./PullOperation'),
    '$pullAll': require('./PullAllOperation'),
    '$push': require('./PushOperation'),
    '$pushAll': require('./PushAllOperation'),
    '$regex': require('./evaluation/RegExpOperation'),
    '$set': require('./SetOperation'),
    '$setOnInsert': require('./SetOnInsertOperation'),
    '$unset' : require('./UnsetOperation'),
    '$options' : require('./OptionsOperation')
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