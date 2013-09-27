'use strict';

var utils = require('./utils');

//-------------------------------------------------------------------------
//
// Public API
//
//-------------------------------------------------------------------------
exports = module.exports = function UpdateModel(Model) {
    updateModel(Model);
};

//-------------------------------------------------------------------------
//
// Private Methods
//
//-------------------------------------------------------------------------

function updateModel(Model){

    Model.prototype.update = function (update, options, cb) {
        if ('function' === typeof options) {
            cb = options;
            options = null;
        }
        for (var item in update) {
            updateItem(this, item, update);
        }
        this.save(function (err) {
            cb(err, 1);
        });
    };

    Model.update = function (query, update, options, cb) {
        if ('function' === typeof options) {
            cb = options;
            options = null;
        }
        Model.find(query, function (err, result) {
            if (err) {
                cb(err, null);
            } else {
                updateMultipleItems(options, result, update, cb);
            }
        });
    };
}



function updateMultipleItems(options, result, update, cb) {
    if (options && options.multi) {
        var saveCount = 0;
        for (var i in result) {
            var updatedItem = result[i];
            for (var item in update) {
                updateItem(updatedItem, item, update);
            }
            /*jshint -W083 */
            result[i].save(function () {
                saveCount++;
                if (saveCount === result.length) {
                    cb(null, result.length);
                }
            });
        }
    } else if (result.length > 0) {
        updateItems(update, result, cb);
    } else {
        cb(null, 0);
    }
}

function updateItems(update, result, cb) {
    for (var item in update) {
        updateItem(result[0], item, update);
    }
    result[0].save(function (err) {
        cb(err, 1);
    });
}

function updateItem(model, item, update) {
    switch (item) {
    case '$pull':
        pullItems(model, update[item]);
        break;
    case '$push':
        pushItem(model, update[item]);
        break;
    default:
        model[item] = update[item];
        break;
    }
}

function pullItem(match, values) {
    for (var i in match) {
        if (match.hasOwnProperty(i)) {
            var index = values.indexOf(match[i]);
            if (index > -1) {
                values.splice(index, 1);
            }
        }
    }
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

function pushItem(model, pushes) {
    for (var push in pushes) {
        if (pushes.hasOwnProperty(push)) {
            var temp = [];
            if (model[push]) {
                temp = temp.concat(model[push]);
            }
            var updates = pushes[push];
            if (updates.$each) {
                temp = temp.concat(updates.$each);
            } else {
                temp.push(updates);
            }
            model[push] = temp;
        }
    }
}