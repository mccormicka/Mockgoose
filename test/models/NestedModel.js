'use strict';

var NestedFoo = {
    foo : [{
        bar : [
            {baz : Number},
        ]
    }]
};


module.exports = function(mongoose) {
    var NestedSchema = new mongoose.Schema(NestedFoo);
    return mongoose.model('DeepNestedEntry', NestedSchema);
};
