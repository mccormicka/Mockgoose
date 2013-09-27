'use strict';

var utils = require('./utils');
var db = require('./db');

//-------------------------------------------------------------------------
//
// Public API
//
//-------------------------------------------------------------------------
exports = module.exports = function UpdateModel(model) {
    updateModel(model);
};

//-------------------------------------------------------------------------
//
// Private Methods
//
//-------------------------------------------------------------------------

function updateModel(Model) {
    Model.prototype.remove = function (cb) {
        Model.remove({_id: this._id}, cb);
    };

    Model.remove = function (query, cb) {
        var type = this().collection.name;
        var results = utils.findModelQuery(db[type], query);
        for (var i = 0; i < results.length; i++) {
            delete db[type][results[i]._id.toString()];
        }
        if (cb) {
            if (results.length === 1) {
                cb(null, results[0]);
            } else {
                cb(null, results);
            }
        }
    };
}