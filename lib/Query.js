'use strict';

var logger = require('nodelogger').Logger(__filename);

exports = module.exports = function Query(Query) {

    var exec = Query.exec;
    var model = Query.model;
    var modelFind = model.collection.find;

    Query.exec = function(callback){

    };
};