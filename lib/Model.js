'use strict';
var db = require('./db');

var Collection = require('./Collection');

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
    // Private Methods that mimic the mongoose api overriding the default driver
    //
    //-------------------------------------------------------------------------

    Model.prototype.collection = new Collection(Model.prototype.collection, Model);
    Model.collection = Model.prototype.collection;

    return Model;
};

