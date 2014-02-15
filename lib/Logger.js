'use strict';

var bunyan = require('bunyan');

exports = module.exports = (function Logger() {
    var logLevel = process.env.BUNYAN_LOG_LEVEL || 'warn';
    return bunyan.createLogger({
        name:'Mockgoose',
        stream: process.stdout,
        level: logLevel
    });
})();
