'use strict';

var _ = require('lodash');
/*jshint -W098 *///options
module.exports = function pushOperation(model, update, options) {
    _.forIn(update, function (value, key) {
			var temp = [];
			if (model[key]) {
				temp = temp.concat(model[key]);
			}
			var updates = value;
			if (updates.$each) {
				temp = temp.concat(updates.$each);
			} else {
				if(typeof value == 'string'){
					temp.push(updates);
				} else {
					if(value.length != undefined){
					_.forEach(value, function(elm){
						temp.push(elm);
					});
					} else {
						temp.push(value);
					}
					
				}
			}
			model[key] = temp;
    });
};