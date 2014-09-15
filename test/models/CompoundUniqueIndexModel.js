'use strict';
module.exports = function (mongoose) {

    var db = mongoose.connection,
        Schema = mongoose.Schema;

    var TYPE = 'compoundUniqueIndex';

    var schema = new Schema({
        owner: { type: String, index: true },
        name: { type: String, index: true }
    });

    /**
     * Expose type to outside world.
     * @type {string}
     */
    schema.statics.TYPE = TYPE;
    schema.index({ owner: 1, name: 1 }, { unique: true });

    return db.model(TYPE, schema);
};
