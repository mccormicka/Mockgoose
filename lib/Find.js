'use strict';

var _ = require('lodash');
var utils = require('./utils');
var db = require('./db');
var mask = require('MongooseMask');

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
function updateModel(Model) {
    Model.find = function mockFind(query, fields, options, cb) {
        if (_.isFunction(query)) {
            cb = query;
            query = {};
            fields = null;
            options = null;
        } else if (_.isFunction(fields)) {
            cb = fields;
            fields = null;
            options = null;
        } else if (_.isFunction(options)) {
            cb = options;
            options = null;
        }
        var results;
        var items = db[this().collection.name];
        if (utils.isEmpty(query)) {
            results = utils.objectToArray(utils.cloneItems(items));
        } else {
            results = utils.findModelQuery(items, query);
        }

        results = filterFields(fields, results);
        cb(null, results);
        return results;
    };

    Model.findOne = function (query, fields, options, cb) {
        if (_.isFunction(query)) {
            cb = query;
            query = {};
            fields = null;
            options = null;
        } else if (_.isFunction(fields)) {
            cb = fields;
            fields = null;
            options = null;
        } else if (_.isFunction(options)) {
            cb = options;
            options = null;
        }
        var results = this.find(query, fields, options, function (err, result) {
            cb(null, result[0]);
            return result[0];
        });
        return results[0];
    };

    Model.findOneAndUpdate = function (query, update, options, cb) {
        if ('function' === typeof options) {
            cb = options;
            options = {};
        }
        Model.findOne(query, function (err, result) {
            if (err) {
                cb(err, null);
            } else if (result) {
                result.update(update, options, function (err) {
                    if (err) {
                        cb(err, result);
                    } else {
                        result.save(cb);
                    }
                });
            } else if (options.upsert) {
                Model.create(update, cb);
            } else {
                cb(null, null);
            }
        });
    };

    Model.findOneAndRemove = function(query, options, callback ){

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
        Model.findOne(query, fields, options, function(err, result){
            if(err){
                callback(err, null);
            }else if(result){
                result.remove(callback);
            }else{
                callback(null, null);
            }
        });
    };
    //Dont need to mock as it delegates to findOneAndRemove
//    Model.findByIdAndRemove = function (id, options, cb) {
//    }

    //Dont need to mock as it delegates to findOne
//        Model.findById = function(modelID, cb) {
//            Model.findMockQuery({_id:modelID}, cb);
//        };

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
                result = mask.expose(result, includes);
            }
            if (excludes.length) {
                result = mask.mask(result, excludes);
            }
            return result;
        });
    }
    return results;
}
