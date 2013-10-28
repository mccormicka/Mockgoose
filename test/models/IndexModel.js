'use strict';
module.exports = function (mongoose) {

    var db = mongoose.connection,
        Schema = mongoose.Schema;

    var TYPE = 'index';

    var schema = new Schema({
        type: {type: String, 'default': TYPE},
        name:String,
        value:Number,
        increment:{type:Number, 'default': 5}
    });

    /**
     * Expose type to outside world.
     * @type {string}
     */
    schema.statics.TYPE = TYPE;

    return db.model(TYPE, schema);
};
