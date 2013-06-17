'use strict';
module.exports = function (mongoose) {

    var db = mongoose.connection,
        Schema = mongoose.Schema;

    var TYPE = 'simple';

    var schema = new Schema({
        type: {type: String, 'default': TYPE},
        name:String,
        value:String,
        bool:Boolean
    });

    /**
     * Expose type to outside world.
     * @type {string}
     */
    schema.statics.TYPE = TYPE;

    return db.model(TYPE, schema);
};
