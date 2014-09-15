'use strict';

var logger = require('./Logger');
var ObjectId = require('mongodb').BSONPure.ObjectID;
var _ = require('lodash');

var db = require('./db');
var utils = require('./utils');
var filter = require('./options/Options');
var validation = require('./validation/Validation');
var operations = require('./operations/Operations');

module.exports = Collection;
function Collection(mongoCollection, Model) {
    var name = this.name = mongoCollection.name;
//    var opts = this.opts = mongoCollection.opts;
//    var conn = this.conn = mongoCollection.conn;
    /*jshint -W064 *///new operator.
    var schema = Model().schema;
    /*jshint -W106 *///Camel_Case
    var indexes = {
        _id_ : [ [ '_id', 1 ] ]
    };
    if (!db[name]) {
        db[name] = {};
    }

    //-------------------------------------------------------------------------
    //
    // un implemented methods. If you need them why not contribute at
    // https://github.com/mccormicka/Mockgoose
    //
    //-------------------------------------------------------------------------


    this.ensureIndex = function (index, options, callback) {
        logger.info('Ensure Index Called with arguments', arguments);
        indexes[_.keys(index)[0] + '_1'] = _.pairs(index);
        logger.info('Created indexes ', indexes);
        callback(null, indexes);
    };

    this.getIndexes = function (callback) {
        return callback(null, indexes);
    };

    this.mapReduce = function () {
        throw new Error('Collection#mapReduce unimplemented by mockgoose!');
    };

    this.save = function () {
        //Save should not need to be implemented! as insert() should be called instead.
        throw new Error('Collection#save unimplemented by mockgoose!');
    };

    //-------------------------------------------------------------------------
    //
    // Implemented drive methods.
    //
    //-------------------------------------------------------------------------

    this.findAndModify = function (conditions, sort, castedDoc, options, callback) {
        if (options.remove) {
            this.remove(conditions, options, callback);
        } else {
            options.modify = true;
            this.update(conditions, castedDoc, options, function (err, results) {
                callback(err, results ? results[0] : null);
            });
        }
    };

    this.findOne = function (conditions, options, callback) {
        this.find(conditions, options, function (err, result) {
            if (err) {
                return callback(err);
            }
            result.toArray(function (err, results) {
                callback(err, results ? results[0] : null);
            });
        });
    };

    this.find = function (conditions, options, callback) {
        var results;
        var models = db[name];
        if (!_.isEmpty(conditions)) {
            results = utils.findModelQuery(models, conditions);
        } else {
            results = utils.objectToArray(utils.cloneItems(models));
        }
        results = filter.applyOptions(options, results);

        if (results.name === 'MongoError') {
            callback(results);
        } else {
            var result = {
                toArray: function (callback) {
                    callback(null, results);
                }
            };
            callback(null, result);
        }
    };

    this.insert = function (obj, options, callback) {
        if (!db[name]) {
            db[name] = {};
        }
        validation.validate(name, obj, schema, function(err){
            if(err){
                return callback(err);
            }
            db[name][obj._id] = obj;
            logOptions(options);
            callback(null, obj);
        });
    };

    this.update = function (conditions, update, options, callback) {
        logOptions(options);
        conditions = conditions || {};
        options.conditions = conditions;
        var self = this;
        this.find(conditions, options, function (err, results) {
            if (err) {
                return callback(err);
            }
            results.toArray(function (err, results) {
                if (!results.length) {
                    options.insert = true;
                    if (options.upsert) {
                        //Found no items.
                        if(_.isUndefined(conditions._id)){
                            conditions._id = new ObjectId();
                        }
                        var insertModel = _.clone(conditions);
                        updateResult(insertModel, update, options);
                        self.insert(insertModel, options, function (err, result) {
                            if (err) {
                                return callback(err);
                            }
                            updateFoundItems(options, [result], update, callback);
                        });
                    } else {
                        callback(null, options.midify ? [] : 0);
                    }
                } else {
                    options.insert = false;
                    updateFoundItems(options, results, update, callback);
                }
            });
        });
    };

    this.remove = function (conditions, options, callback) {
        this.find(conditions, options, function (err, results) {
            if (err) {
                return callback(err);
            }
            results.toArray(function (err, results) {
                if (options.remove) {
                    //If set to remove then only remove one item.
                    if (results.length) {
                        results = results[0];
                        delete db[name][results._id];
                    } else {
                        results = null;
                    }
                } else {
                    _.each(results, function (result) {
                        delete db[name][result._id];
                    });
                }
                callback(null, results);
            });
        });
    };

    this.count = function (conditions, options, callback) {
        this.find(conditions, options, function (err, results) {
            if (err) {
                return callback(err);
            }
            results.toArray(function (err, results) {
                callback(err, results.length);
            });
        });
    };

    this.distinct = function (distinctProperty, conditions, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }
        this.find(conditions, options, function (err, results) {
            if (err) {
                return callback(err);
            }
            results.toArray(function (err, results) {

                var props = [];
                _.each(results, function(item){
                    var value = utils.findNestedValue(item, distinctProperty);
                    if(value){
                        props.push(value);
                    }
                });
                var distinctArray = _.uniq(props);
                callback(err, distinctArray);
            });
        });
    };

    //-------------------------------------------------------------------------
    //
    // Private Methods
    //
    //-------------------------------------------------------------------------

    function getOperation(type){
        return operations.getOperation(type);
    }

    function logOptions(options) {
        if (!_.isEmpty(options)) {
            logger.debug('Options are', options);
        }
    }

    function updateFoundItems(options, results, update, callback) {
        if (!options.multi) {
            results = [results[0]];
        }
        if (!options['new']) {
            //Return original docs if new not specified.
            var originals = _.clone(results);
            updateResults(results, update, options);
            callback(null, options.modify ? originals : originals.length);
        } else {
            //Return modified items
            updateResults(results, update, options);
            callback(null, options.modify ? results : results.length);
        }
    }

    function updateResults(results, update, options) {
        _.each(results, function (result) {
            updateResult(result, update, options);
            db[name][result._id] = result;
        });
    }

    function updateResult(result, update, options) {
        _.forIn(update, function (update, type) {
            getOperation(type)(result, update, options);
        });
    }
}
