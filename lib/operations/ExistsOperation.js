'use strict';

/**
 * Implementation of $exists
 * @see http://docs.mongodb.org/manual/reference/operator/query/exists/
 */
module.exports = function  operation(model, update, options) {
	return (typeof model[options.queryItem] !== 'undefined') === update.$exists;
};
