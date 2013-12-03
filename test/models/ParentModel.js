'use strict';
module.exports = function (connection) {

    var db = connection;

    var TYPE = 'parent';
    var schema = connection.model('____' + TYPE, {}).schema;

    schema.add({
        type: {type: String, 'default': TYPE},
        name: String,
        childs:[{ type: connection.Schema.Types.ObjectId, ref: '____simple' }]
    });

    /**
     * Expose type to outside world.
     * @type {string}
     */
    schema.statics.TYPE = TYPE;

    return db.model(TYPE, schema);
};
