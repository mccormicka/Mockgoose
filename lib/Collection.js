'use strict';

var logger = require('nodelogger').Logger(__filename);
var _ = require('lodash');
var utils = require('./utils');
var filter = require('./options');
var db = require('./db');
var ObjectId = require('mongodb').BSONPure.ObjectID;
var validation = require('./Validation');

module.exports = Collection;
function Collection(mongoCollection, Model) {

    var name = this.name = mongoCollection.name;
//    var opts = this.opts = mongoCollection.opts;
//    var conn = this.conn = mongoCollection.conn;
    /*jshint -W064 *///new operator.
    var schema = Model().schema;

    if (!db[name]) {
        db[name] = {};
    }

    var operations = {
        '$pull': pullOperation,
        '$push': pushOperation,
        '$set': setOperation
    };

    //-------------------------------------------------------------------------
    //
    // un implemented methods. If you need them why not contribute at
    // https://github.com/mccormicka/Mockgoose
    //
    //-------------------------------------------------------------------------

    this.ensureIndex = function () {
        throw new Error('Collection#ensureIndex unimplemented by mockgoose!');
    };

    this.getIndexes = function () {
        throw new Error('Collection#getIndexes unimplemented by mockgoose!');
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
                callback(err, results[0]);
            });
        }
    };

    this.findOne = function (conditions, options, callback) {
        this.find(conditions, options, function (err, result) {
            if (err) {
                return callback(err);
            }
            result.toArray(function (err, results) {
                callback(err, results[0]);
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
            if (!_.isEmpty(options)) {
                logger.warn('Options are', options);
            }
            callback(null, obj);
        });
    };

    this.update = function (conditions, update, options, callback) {
        if (!_.isEmpty(options)) {
            logger.warn('Options are', options);
        }
        var self = this;
        this.find(conditions, options, function (err, results) {
            if (err) {
                return callback(err);
            }
            results.toArray(function (err, results) {
                if (!results.length) {
                    if (options.upsert) {
                        //Found no items.
                        self.insert({
                            _id: new ObjectId()
                        }, options, function (err, result) {
                            if (err) {
                                return callback(err);
                            }
                            updateFoundItems(options, [result], update, callback);
                        });
                    } else {
                        callback(null, options.midify ? [] : 0);
                    }
                } else {
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

    this.count = function (conditions, callback) {
        this.find(conditions, {}, function (err, results) {
            if (err) {
                return callback(err);
            }
            results.toArray(function (err, results) {
                callback(err, results.length);
            });
        });
    };


    //-------------------------------------------------------------------------
    //
    // Private Methods
    //
    //-------------------------------------------------------------------------

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
        _.forIn(update, function (update, key) {
            operations[key](result, update, options);
        });
    }

    function pullOperation(model, update, options) {
        pullItems(model, update);
    }

    function pullItem(match, values) {
        for (var i in match) {
            if (match.hasOwnProperty(i)) {
                var index = indexOf(values, match[i]);
                if (index > -1) {
                    values.splice(index, 1);
                }
            }
        }
    }

    function indexOf(values, match) {
        var index = -1;
        var foundItem = _.find(values, function (value) {
            index++;
            return deepEquals(value, match);
        });
        if (foundItem) {
            return index;
        }
        return -1;
    }

    /**
     * Implementation from
     * http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
     */
    function deepEquals(x, y) {
        if (x === y) {
            return true;
        }
        // if both x and y are null or undefined and exactly the same

        if (!( x instanceof Object ) || !( y instanceof Object )) return false;
        // if they are not strictly equal, they both need to be Objects

        if (x.constructor !== y.constructor) return false;
        // they must have the exact same prototype chain, the closest we can do is
        // test there constructor.

        for (var p in x) {
            if (!x.hasOwnProperty(p)) continue;
            // other properties were tested using x.constructor === y.constructor

            if (!y.hasOwnProperty(p)) return false;
            // allows to compare x[ p ] and y[ p ] when set to undefined

            if (x[ p ] === y[ p ]) continue;
            // if they have the same strict value or identity then they are equal

            if (typeof( x[ p ] ) !== "object") return false;
            // Numbers, Strings, Functions, Booleans must be strictly equal

            if (!deepEquals(x[ p ], y[ p ])) return false;
            // Objects and Arrays must be tested recursively
        }

        for (p in y) {
            if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) return false;
            // allows x[ p ] to be set to undefined
        }
        return true;
    }

    function pullItems(model, pulls) {
        for (var pull in pulls) {
            if (pulls.hasOwnProperty(pull)) {
                var values = model[pull];
                var match = utils.findMatch(values, pulls[pull]);
                if (match.length > 0) {
                    pullItem(match, values);
                }
            }
        }
    }

    function pushOperation(model, update, options) {
        _.forIn(update, function (value, key) {
            var temp = [];
            if (model[key]) {
                temp = temp.concat(model[key]);
            }
            var updates = value;
            if (updates.$each) {
                temp = temp.concat(updates.$each);
            } else {
                temp.push(updates);
            }
            model[key] = temp;
        });
    }

    function setOperation(model, update, options) {
        _.forIn(update, function (value, key) {
            model[key] = value;
        });
    }
}