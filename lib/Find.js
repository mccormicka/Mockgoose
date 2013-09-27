'use strict';

var utils = require('./utils');
var db = require('./db');

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

function updateModel(Model){
    Model.find = function mockFind(query, cb) {
        var results;
        var items = db[this().collection.name];
        if (utils.isEmpty(query)) {
            results = utils.objectToArray(utils.cloneItems(items));
            cb(null, results);
            return results;
        }
        results = utils.findModelQuery(items, query);
        cb(null, results);
        return results;
    };

    Model.findOne = function (query, cb) {
        var results = this.find(query, function (err, result) {
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
}

//Dont need to mock as it delegates to findOne
//        Model.findById = function(modelID, cb) {
//            Model.findMockQuery({_id:modelID}, cb);
//        };
//Dont need to mock as it delegates to save.
//        Model.create = function mockCreate(item, cb){
//            console.log('Calling Fake Create method');
//        };
