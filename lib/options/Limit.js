'use strict';

module.exports = function limit(value, items) {
    if (!value || !items) {
        return items;
    }
    return items.slice(0, value);
};
