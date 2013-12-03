'use strict';

var logger = require('../Logger');

var operations = {
    '$pull': require('./PullOperation'),
    '$pullAll': require('./PullAllOperation'),
    '$push': require('./PushOperation'),
    '$pushAll': require('./PushAllOperation'),
    '$set': require('./SetOperation'),
    '$inc': require('./IncOperation'),
    '$addToSet' : require('./AddToSetOperation')
};

module.exports.getOperation  = function getOperation(type){
    if(!operations[type]){
        logger.error('Mockgoose currently does not support the ' + type + ' operation' );
        return false;
    }
    return operations[type];
};