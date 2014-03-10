'use strict';

var _ = require('lodash');

/*jshint -W098 *///options
module.exports = function operation(model, update, options) {
    return model[options.queryItem] <= update.$lte;
};
