var mongoose = require('mongoose');
var path = require('path');
var mockgoose = require(path.join(__dirname, '../Mockgoose'));
var expect = require('chai').expect;

mockgoose(mongoose);


// BUG: will not show `Cannot find module 'this-module-not-found'` error
describe('bug 179', function() {
	before(function(done) {
		mongoose.connect('mongodb://localhost:27017/test', function() {
			done();	
		});
	});
	it('should throw an error', function(done) {
		expect(function() {require('this-module-not-found')}).to.throw(/Cannot find module/);
		done();
	});

});
