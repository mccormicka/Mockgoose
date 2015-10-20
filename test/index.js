var should = require('chai').should();
var expect = require('chai').expect;

var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();

var mockgoose = require('mockgoose');
mockgoose(mongoose);
mongoose.connect('mongodb://localhost/TestingDB');

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