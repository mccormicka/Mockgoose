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
        return findMockQuery(this().collection.name, query, cb);
    };

    Model.findOne = function (query, cb) {
        return findMockQuery(this().collection.name, query, cb);
    };

    Model.remove = function (query, cb) {
        var type = this().collection.name;
        findMockQuery(type, query, function (err, value) {
            if (value) {
                delete models[type][value._id.toString()];
                cb(null, value);
            } else {
                cb(err);
            }
        });
    };

    Model.findAll = function (done) {
        var results = [];
        var mods = models[this().collection.name];
        for (var model in mods) {
            results.push(mods[model]);
        }
        done(null, results);
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

function cloneItem(item) {
    return new item.mockModel(item);
}

function cloneMock(item, callBack) {
    var clone = cloneItem(item);
    if (clone) {
        callBack(null, clone);
    } else {
        callBack('MOCK ERROR: Cloning mock mongoose object.' + item);
    }
}

function foundObject(items, query, key, q, callBack) {
    if (items[key][q].toString() === query[q].toString()) {
        var allMatch = true;
        for (var qq in query) {
            if (items[key][qq].toString() !== query[qq].toString()) {
                allMatch = false;
                break;
            }
        }
        if (allMatch) {
            cloneMock(items[key], callBack);
            return true;
        }
    }
    return false;
}

function findMockQuery(type, query, callBack) {
    var items = models[type];
    for (var key in items) {
        for (var q in query) {
            if (foundObject(items, query, key, q, callBack)) {
                return;
            }
        }
    }
    callBack(null, null);
}

function validatePath(model, pathName, type, error) {
    var path = model.schema.paths[pathName];
    if (path.options.unique) {
        var query = {};
        query[pathName] = model[pathName];
        findMockQuery(type, query, function (err, value) {
            if (value) {
                var errMessage = util.format('E11000 duplicate key error index: %s', pathName);
                var code = 11000;
                error = new Error(errMessage, code);
                error.name = 'MongoError';
                error.code = code;
                return;
            }
        });
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