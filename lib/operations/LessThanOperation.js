'use strict';

//http://docs.mongodb.org/manual/reference/operator/query/lt/
module.exports = function operation(model, update, options) {
    return model[options.queryItem] < update.$lt;
};
