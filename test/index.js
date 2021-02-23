'use strict';

require('chai').should();
var expect = require('chai').expect;
var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();
var Mockgoose = require('../built/mockgoose').Mockgoose;
var mockgoose = new Mockgoose(mongoose);
var Cat = mongoose.model('Cat', { name: String });

describe('User functions', function() {
	before(function(done) {
		mockgoose.prepareStorage().then(function() {
			mongoose.connect('mongodb://127.0.0.1:27017/TestingDB', { useNewUrlParser: true }, function(err) {
				done(err);
			}); 
		});
	});

	after(function() {
		return mockgoose.shutdown();
	});

    it("isMocked", function(done) {
		expect(mockgoose.helper.isMocked()).to.be.true;
		done();
	});
	
    it("should create a cat foo", function(done) {
		Cat.create({name: "foo"}, function(err) {
		    expect(err).not.to.be.ok;
			done(err);
		});
    });

    it("should find cat foo", function(done) {
    	Cat.findOne({name: "foo"}, function(err) {
	    	expect(err).not.to.be.ok;
    	    done(err);
    	});
    });

    it("should remove cat foo", function(done) {
    	Cat.deleteMany({name: "foo"}, function(err) {
	    	expect(err).not.to.be.ok;
    	    done(err);
    	});
    });

    it("reset", function(done) {
    	mockgoose.helper.reset().then(function() {
    	    done();
    	});
    });
});
