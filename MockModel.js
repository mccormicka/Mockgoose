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

    Model.findOneAndUpdate = function(query, update, options, cb){
        if ('function' === typeof options) {
            cb = options;
            options = null;
        }
        Model.findOne(query, function(err, result){
            if(err){
                cb(err, null);
            }else{
                result.update(update, options, function(err, result){
                    if(err){
                        cb(err,result);
                    }else{
                        result.save(cb);
                    }
                });
            }
        });
    };

    Model.prototype.update = function(update, options, cb){
        if ('function' === typeof options) {
            cb = options;
            options = null;
        }
        for(var item in update){
            updateItem(this, item, update);
        }
        cb(null, this);
    };

    Model.update = function(query, update, options, cb){
        Model.find(query, function(err, result){
            if(err){
                cb(err, null);
            }else{
                for(var i in result){
                    result[i].update(update, options, function(err, result){
                        if(err){
                            cb(err, 0);
                            return;
                        }
                    });
                }
                cb(null, result.length);
            }
        });
    };

    Model.prototype.remove = function(cb){
        Model.remove({_id: this._id}, cb);
    };

    Model.remove = function (query, cb) {
        var type = this().collection.name;
        var results = findModelQuery(type, query);
        for (var i = 0; i < results.length; i++) {
            delete models[type][results[i]._id.toString()];
        }
        if(cb){
            if (results.length === 1) {
                cb(null, results[0]);
            } else {
                cb(null, results);
            }
        }
    };

    Model.findAll = function (done) {
        done(null, objectToArray(models[this().collection.name]));
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
    if(item.mockModel){
        return new item.mockModel(item);
    }else{
        console.log('Returning actual model this may be mutated!');
        return item;
    }

}

function contains(obj, target) {
    if (!obj) return false;
    return obj.indexOf(target) !== -1;
}

function matchParams(item, query, q){
    if(typeof item[q] === 'string'){
        if (item[q].toString() === query[q].toString()) {
            return true;
        }
    }
    if (typeof query[q] === 'object') {
        if (query[q].$in) {
            for (var i in query[q].$in) {
                if (contains(item[q], query[q].$in[i])) {
                    return true;
                }
            }
        }
    }
    if(typeof item[q] === 'boolean'){
        return item[q] === query[q];
    }
    return false;
}

function updateItem(model, item, update){
    switch(item){
    case '$pull':
        pullItem(model, update[item]);
        break;
    default:
        model[item] = update[item];
        break;
    }
}

function pullItem(model, pulls){
    for( var pull in pulls){
        if(pulls.hasOwnProperty(pull)){
            var values = model[pull];
            var match = findMatch(values, pulls[pull]);
            if(match.length > 0){
                for( var i in match ){
                    var index = values.indexOf(match[i]);
                    if(index > -1){
                        values.splice(index, 1);
                    }
                }
            }
        }
    }
}

function foundModel(item, query, q) {
    if(matchParams(item, query, q)){
        var allMatch = true;
        for (var qq in query) {
            if(!matchParams(item, query, qq)){
                allMatch = false;
                break;
            }
        }
        if (allMatch) {
            return cloneItem(item);
        }
    }
    return false;
}

function findMatch(items, query){
    var results = {};
    for (var key in items) {
        for (var q in query) {
            var item = foundModel(items[key], query, q);

            if (item) {
                if(item._id){
                    results[item._id] = item;
                }else{
                    results[Math.random()] = item;
                }
            }
        }
    }
    return objectToArray(results);
}

function findModelQuery(type, query) {
    var items = models[type];
    return findMatch(items, query);
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