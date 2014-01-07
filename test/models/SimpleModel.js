'use strict';
module.exports = function (connection) {

    var db = connection;

    var TYPE = 'simple';
    var schema = connection.model('____' + TYPE, {}).schema;

    schema.add({
        type: {type: String, 'default': TYPE},
        name: String,
        value: String,
        bool: Boolean,
        date: Date,
        profile:{}
    });

    /**
     * Expose type to outside world.
     * @type {string}
     */
    schema.statics.TYPE = TYPE;

    return db.model(TYPE, schema);
};
