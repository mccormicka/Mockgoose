'use strict';

var _ = require('lodash');
/*jshint -W098 *///options
module.exports = function  unsetOperation(model, update, options) {
	_.forIn(update, function (value, key) {
		delete model[key];
	});
};