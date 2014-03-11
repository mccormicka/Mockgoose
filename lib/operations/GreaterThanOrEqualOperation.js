'use strict';

//http://docs.mongodb.org/manual/reference/operator/query/gte/
module.exports = function operation(model, update, options) {
    return model[options.queryItem] >= update.$gte;
};
