'use strict';

var mongoose = require('mongoose');
var path = require('path');
var Mockgoose = require(path.join(__dirname, '../built/mockgoose')).Mockgoose;
var expect = require('chai').expect;

var mockgoose = new Mockgoose(mongoose);

// BUG: will not show `Cannot find module 'this-module-not-found'` error
describe('bug 179', function() {
	before(function(done) {
		mockgoose.prepareStorage().then(function() {
			mongoose.connect('mongodb://foobar:27017/test', { useNewUrlParser: true }, function() {
				done();	
			});
		});
	});

	it('should throw an error', function(done) {
		expect(function() {
			require('this-module-not-found');
		}).to.throw(/Cannot find module/);
		done();
	});
});
