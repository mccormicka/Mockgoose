'use strict';

/**
 * Implementation of $gt
 * @see http://docs.mongodb.org/manual/reference/operator/query/gt/
 */
module.exports = function operation(model, update, options) {
    return model[options.queryItem] > update.$gt;
};
