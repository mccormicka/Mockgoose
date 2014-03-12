'use strict';
/**
 * Implementation of skip
 * @see http://docs.mongodb.org/manual/reference/method/db.collection.find/#set-the-starting-point-of-the-result-set
 */
module.exports = function skip(value, items) {
    if (!value || !items) {
        return items;
    }

    return items.slice(value);
};
