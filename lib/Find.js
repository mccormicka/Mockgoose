'use strict';

var _ = require('lodash');
var utils = require('./utils');
var db = require('./db');
var mask = require('mongoosemask');

//-------------------------------------------------------------------------
//
// Public API
//
//-------------------------------------------------------------------------
exports = module.exports = function FindModel(Model) {
    updateModel(Model);
};

//-------------------------------------------------------------------------
//
// Private Methods
//
//-------------------------------------------------------------------------

function jsonResults(results) {
    return _.map(results, function (result) {
        return result.toJSON();
    });
}

function updateModel(Model) {

    Model.collection.find =
        function findModel(conditions, options, callback) {
            console.log('Override find on collection');
            var modelName = this.name;
            var results;
            var items = db[modelName];
            if (utils.isEmpty(conditions)) {
                results = utils.objectToArray(utils.cloneItems(items));
            } else {
                results = utils.findModelQuery(items, conditions);
            }

            results = applyOptions(options, results);
            results = filterFields(options.fields, results);
            results = jsonResults(results);
            if (_.isFunction(callback)) {
                var result = {
                    toArray: function (callback) {
                        callback(null, results);
                    }
                };
                callback(null, result);
            }
        };

    Model.collection.findOne = function(conditions, options, callback){
        this.find(conditions, options, function(err, result){
            result.toArray(function(err, results){
                callback(err, results[0]);
            });
        });
    };

    Model.collection.update = function () {
        console.log('Calling update');
    };
    Model.collection.findAndModify =
        function findAndModifyModel(castedQuery, sort, castedDoc, opts, callback) {
            var options = opts;
            opts.sort = sort;
            this.findOne(castedQuery, options, function (err, result) {
                    if (!result && opts.upsert) {
                        Model.create(castedQuery, function (err, result) {
                            result.update(castedDoc, function (err) {
                                callback(err, result.toJSON());
                            });
                        });
                    } else {
                        var model = db[Model.collection.name][result._id].mockModel;
                        //update all objects here.
                        model.update(castedDoc, function(err){
                            callback(err, result.toJSON());
                        });
                    }
                }
            );
        };

//    var modelFind = Model.find;
//    Model.find = function mockFind(conditions, fields, options, cb) {
//
//        var modelName = this.collection.name;
//        var query = modelFind.call( this, conditions, fields, options);
//        this.collection.find = function(findConditions, findOptions, findCallback){
//            var results;
//            var items = db[modelName];
//            if (utils.isEmpty(findConditions)) {
//                results = utils.objectToArray(utils.cloneItems(items));
//            } else {
//                results = utils.findModelQuery(items, findConditions);
//            }
//
//            results = applyOptions(findOptions, results);
//            results = filterFields(fields, results);
//            results = jsonResults(results);
//            if (_.isFunction(findCallback)) {
//                var result = {
//                    toArray: function(callback){
//                        callback(null, results);
//                    }
//                };
//                findCallback(null, result);
//            }
//        };
//        if(_.isFunction(cb)){
//            query.exec(cb);
//        }
//        return query;
//
////        if (_.isFunction(conditions)) {
////            cb = conditions;
////            conditions = {};
////            fields = null;
////            options = null;
////        } else if (_.isFunction(fields)) {
////            cb = fields;
////            fields = null;
////            options = null;
////        } else if (_.isFunction(options)) {
////            cb = options;
////            options = null;
////        }
////        var results;
////        var items = db[this().collection.name];
////        if (utils.isEmpty(conditions)) {
////            results = utils.objectToArray(utils.cloneItems(items));
////        } else {
////            results = utils.findModelQuery(items, conditions);
////        }
////
////        results = applyOptions(options, results);
////        results = filterFields(fields, results);
////        if (_.isFunction(cb)) {
////            cb(null, results);
////        }
////        return query;
//    };

    function applyOptions(options, items) {
        if (!_.isNull(options) && !_.isUndefined(options)) {
            items = sortItems(options.sort, items);
        }
        return items;
    }

    function sortNumeric(value, items, key) {
        if (value === 1) {
            items.sort(function (a, b) {
                return a[key] - b[key];
            });
        } else {
            items.sort(function (a, b) {
                return b[key] - a[key];
            });
        }
    }

    function sortAlpha(value, items, key) {
        if (value === 1) {
            items.sort(function (a, b) {
                return a[key].localeCompare(b[key]);
            });
        } else {
            items.sort(function (a, b) {
                return b[key].localeCompare(a[key]);
            });
        }
    }

    function sortItems(sort, items) {
        var item = items[0];
        if (!_.isUndefined(item) && !_.isUndefined(sort)) {
            _.forIn(sort, function (value, key) {
                if (item[key]) {
                    if (_.isNumber(item[key])) {
                        sortNumeric(value, items, key);
                    } else {
                        sortAlpha(value, items, key);
                    }
                }
            });
        }
        return items;
    }

//    Model.findOne = function (query, fields, options, cb) {
//        if (_.isFunction(query)) {
//            cb = query;
//            query = {};
//            fields = null;
//            options = null;
//        } else if (_.isFunction(fields)) {
//            cb = fields;
//            fields = null;
//            options = null;
//        } else if (_.isFunction(options)) {
//            cb = options;
//            options = null;
//        }
//        var results = this.find(query, fields, options, function (err, result) {
//            cb(null, result[0]);
//            return result[0];
//        });
//        return results[0];
//    };

//    Model.findOneAndUpdate = function (query, update, options, cb) {
//        if ('function' === typeof options) {
//            cb = options;
//            options = {};
//        }
//        Model.findOne(query, function (err, result) {
//            if (err) {
//                cb(err, null);
//            } else if (result) {
//                result.update(update, options, function (err) {
//                    if (err) {
//                        cb(err, result);
//                    } else {
//                        result.save(cb);
//                    }
//                });
//            } else if (options.upsert) {
//                Model.create(update, cb);
//            } else {
//                cb(null, null);
//            }
//        });
//    };

    Model.findOneAndRemove = function (query, options, callback) {

        if (1 === arguments.length && _.isFunction(query)) {
            var msg = 'Model.findOneAndRemove(): First argument must not be a function.\n\n' +
                '  ' + this.modelName + '.findOneAndRemove(conditions, callback)\n' +
                '  ' + this.modelName + '.findOneAndRemove(conditions)\n' +
                '  ' + this.modelName + '.findOneAndRemove()\n';
            throw new TypeError(msg);
        }

        if (_.isFunction(options)) {
            callback = options;
            options = undefined;
        }

        var fields;
        if (options) {
            fields = options.select;
            options.select = undefined;
        }
        Model.findOne(query, fields, options, function (err, result) {
            if (err) {
                callback(err, null);
            } else if (result) {
                result.remove(callback);
            } else {
                callback(null, null);
            }
        });
    };

    //Dont need to mock as it delegates to findOneAndRemove
//    Model.findByIdAndUpdate
    //Dont need to mock as it delegates to findOneAndRemove
//    Model.findByIdAndRemove
    //Dont need to mock as it delegates to findOne
//        Model.findById

}

function filterFields(fields, results) {
    var includes = [];
    var excludes = [];
    if (fields) {
        if (_.isObject(fields)) {
            _.forIn(fields, function (value, key) {
                if (value === 1) {
                    includes.push(key);
                } else {
                    excludes.push(key);
                }
            });
        } else if (_.isString(fields)) {
            _.each(fields.split(' '), function (field) {
                if (field.indexOf('-') > -1) {
                    excludes.push(field.slice(1));
                } else {
                    includes.push(field);
                }
            });
        } else {
            throw new Error('Fields must be a string or an object!');
        }
    }

    if (includes.length || excludes.length) {
        results = _.map(results, function (result) {
            if (includes.length) {
                result._doc = mask.expose(result, includes);
            }
            if (excludes.length) {
                result._doc = mask.mask(result, excludes);
            }
            return result;
        });
    }
    return results;
}
