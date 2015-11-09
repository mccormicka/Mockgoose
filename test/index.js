var should = require('chai').should();
var expect = require('chai').expect;

var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();

var mockgoose = require('../Mockgoose');
mockgoose(mongoose);

before(function(done) {
    mongoose.connect('mongodb://example.com/TestingDB', function(err) {
        done(err);
    }); 
});

describe('User functions', function() {
	it("should create a user foo", function(done) {
            done();
    });
});