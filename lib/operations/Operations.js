'use strict';

var logger = require('nodelogger').Logger(__filename);

var operations = {
    '$pull': require('./PullOperation'),
    '$push': require('./PushOperation'),
    '$pushAll': require('./PushOperation'),
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