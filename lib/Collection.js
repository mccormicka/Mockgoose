'use strict';

var logger = require('nodelogger').Logger(__filename);
var _ = require('lodash');
var utils = require('./utils');
var filter = require('./options');
var db = require('./db');

module.exports = Collection;
function Collection(mongoCollection) {

    var name = this.name = mongoCollection.name;
    var opts = this.opts = mongoCollection.opts;
    var conn = this.conn = mongoCollection.conn;

    if (!db[name]) {
        db[name] = {};
    }

    this.ensureIndex = function () {
        throw new Error('Collection#ensureIndex unimplemented by driver');
    };

    /**
     * Abstract method that drivers must implement.
     */

    this.findAndModify = function () {
        throw new Error('Collection#findAndModify unimplemented by driver');
    };

    /**
     * Abstract method that drivers must implement.
     */

    this.findOne = function (conditions, options, callback) {
        this.find(conditions, options, function (err, result) {
            if (err) {
                return callback(err);
            }
            result.toArray(function(err, results){
                callback(err, results[0]);
            });
        });
    };

    /**
     * Abstract method that drivers must implement.
     */

    this.find = function (conditions, options, callback) {
        var results;
        var models = db[name];
        if (!_.isEmpty(conditions)) {
            results = utils.findModelQuery(models, conditions);
        }else{
            results = utils.objectToArray(utils.cloneItems(models));
        }
        results = filter.applyOptions(options, results);

        var result = {
            toArray: function (callback) {
                callback(null, results);
            }
        };

        callback(null, result);
    };

    /**
     * Abstract method that drivers must implement.
     */

    this.insert = function (obj, options, complete) {
        if (!db[name]) {
            db[name] = {};
        }
        db[name][obj._id] = obj;
        if (!_.isEmpty(options)) {
            logger.warn('Options are', options);
        }
        complete(null, obj);
    };

    /**
     * Abstract method that drivers must implement.
     */

    this.save = function () {
        throw new Error('Collection#save unimplemented by driver');
    };

    /**
     * Abstract method that drivers must implement.
     */

    this.update = function () {
        throw new Error('Collection#update unimplemented by driver');
    };

    /**
     * Abstract method that drivers must implement.
     */

    this.getIndexes = function () {
        throw new Error('Collection#getIndexes unimplemented by driver');
    };

    /**
     * Abstract method that drivers must implement.
     */

    this.mapReduce = function () {
        throw new Error('Collection#mapReduce unimplemented by driver');
    };
}