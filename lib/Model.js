'use strict';

var find = require('./Find');
var update = require('./Update');
var remove = require('./Remove');
var validation = require('./Validation');
var _ = require('lodash');
var db = require('./db');

//-------------------------------------------------------------------------
//
// Public Methods
//
//-------------------------------------------------------------------------

module.exports = function (Model) {

    /**
     * Mockgoose method to allow resetting of the db.
     * reset() will wipe the entire database.
     * reset('schema name') will remove all models associated with the schema.
     * @param type
     * @returns {boolean}
     */
    Model.reset = function (type) {
        return db.reset(type);
    };


    //-------------------------------------------------------------------------
    //
    // Private Methods that mimic the mongoose api.
    //
    //-------------------------------------------------------------------------

    Model.prototype.save = function (cb) {
        var model = this;
        var type = model.collection.name;
        if (!db[type]) {
            db[type] = {};
        }
        //Validate model before saving.
        validation.validateModel(model, cb, type, Model);
    };

    //Add custom Find Methods.
    find(Model);
    //Add custom Update Methods.
    update(Model);
    //Add Custom Remove Methods.
    remove(Model);

//Dont need to mock as it delegates to save.
//        Model.create = function mockCreate(item, cb){
//        };

    Model.count = function (query, cb) {
        if (_.isFunction(query)) {
            cb = query;
            query = {};
        }
        Model.find(query, function (err, result) {
            cb(err, result.length);
        });
    };

    return Model;
};

