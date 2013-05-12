'use strict';
var util = require('util');
var models = {};

//-------------------------------------------------------------------------
//
// Public Methods
//
//-------------------------------------------------------------------------

module.exports = function (Model) {
    Model.prototype.save = function (cb) {
        var model = this;
        var type = model.collection.name;
        if (!models[type]) {
            models[type] = {};
        }

        model.validate(function (err) {
            if (err) {
                return cb(err);
            }
            validateOptions(type, model, function (err) {
                if (err) {
                    return cb(err, null);
                }
                var modelID = model._id.toString();
                var temp = JSON.parse(JSON.stringify(model));
                temp.mockModel = Model;
                models[type][modelID] = temp;
                if (!cb) {
                    throw new Error('Mongoose save callback must be defined!');
                }
                return cb(null, model);
            });
        });
    };

    //Dont need to mock as it delegates to findOne
//        Model.findById = function(modelID, cb) {
//            Model.findMockQuery({_id:modelID}, cb);
//        };
    //Dont need to mock as it delegates to save.
//        Model.create = function mockCreate(item, cb){
//            console.log('Calling Fake Create method');
//        };

    Model.find = function mockFind(query, cb) {
        var results = findModelQuery(this().collection.name, query);
        cb(null, results);
        return results;
    };

    Model.findOne = function (query, cb) {
        var results = findModelQuery(this().collection.name, query);
        cb(null, results[0]);
        return results[0];

    };

    Model.remove = function (query, cb) {
        var type = this().collection.name;
        var results = findModelQuery(type, query);
        for (var i = 0; i < results.length; i++) {
            delete models[type][results[i]._id.toString()];
        }
        if (results.length === 1) {
            cb(null, results[0]);
        } else {
            cb(null, results);
        }
    };

    Model.findAll = function (done) {
        console.log('Find all Called.')
        done(null, objectToArray(models[this().collection.name]));
    };

    Model.update = function () {
        throw new Error('Model updates are not supported by MockGoose please use save() isntead ', arguments);
    };

    /**
     * Mockgoose method to allow resetting of the models.
     * reset() will wipe the entire database.
     * reset('schema name') will remove all models associated with the schema.
     * @param type
     * @returns {boolean}
     */
    Model.reset = function (type) {
        if (!type) {
            models = {};
        } else {
            delete models[type];
        }
        return true;
    };

    return Model;
};

//-------------------------------------------------------------------------
//
// Private Methods
//
//-------------------------------------------------------------------------

/**
 * Converts the object into an array.
 * @param items
 * @returns {Array}
 */
function objectToArray(items) {
    var results = [];
    for (var model in items) {
        results.push(items[model]);
    }
    return results;
}

/**
 * Creates a new instance from the model so that
 * if the original is updated but not saved it is
 * not manipulated in the database.
 * @param item
 * @returns {item.mockModel}
 */
function cloneItem(item) {
    return new item.mockModel(item);
}

function findModel(items, query, key, q) {
    if (items[key][q].toString() === query[q].toString()) {
        var allMatch = true;
        for (var qq in query) {
            if (items[key][qq].toString() !== query[qq].toString()) {
                allMatch = false;
                break;
            }
        }
        if (allMatch) {
            return cloneItem(items[key]);
        }
    }
    return false;
}

function findModelQuery(type, query) {
    var items = models[type];
    var results = {};
    for (var key in items) {
        for (var q in query) {
            var item = findModel(items, query, key, q);
            if (item) {
                results[item._id] = item;
            }
        }
    }
    return objectToArray(results);
}

function validatePath(model, pathName, type, error) {
    var path = model.schema.paths[pathName];
    if (path.options.unique) {
        var query = {};
        query[pathName] = model[pathName];
        var results = findModelQuery(type, query);
        if (results.length > 0) {
            var errMessage = util.format('E11000 duplicate key error index: %s', pathName);
            var code = 11000;
            error = new Error(errMessage, code);
            error.name = 'MongoError';
            error.code = code;
            return error;
        }
    }
    return error;
}

function validateOptions(type, model, cb) {
    var error = null;
    if (!models[type][model._id.toString()]) {
        for (var pathName in model.schema.paths) {
            error = validatePath(model, pathName, type, error);
        }
    }
    cb(error);
}