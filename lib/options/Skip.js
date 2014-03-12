'use strict';

module.exports = function skip(value, items) {
    if (!value || !items) {
        return items;
    }

    return items.slice(value);
};
