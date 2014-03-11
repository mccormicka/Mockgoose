'use strict';

/*jshint -W098 *///options
var _ = require('lodash');
/**
 * Implementation of $unset
 * @see http://docs.mongodb.org/manual/reference/operator/update/unset/
 */
module.exports = function  unsetOperation(model, update, options) {
	_.forIn(update, function (value, key) {
		delete model[key];
	});
};