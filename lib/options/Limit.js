'use strict';
/**
 * Implementation of limit option
 * @see http://docs.mongodb.org/manual/reference/method/db.collection.find/#limit-the-number-of-documents-to-return
 */
module.exports = function limit(value, items) {
    if (!value || !items) {
        return items;
    }
    return items.slice(0, value);
};
