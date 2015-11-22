var should = require('chai').should();
var expect = require('chai').expect;

var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();

var mockgoose = require('../Mockgoose');

var Cat = mongoose.model('Cat', { name: String });

mockgoose(mongoose);

before(function(done) {
    mongoose.connect('mongodb://example.com/TestingDB', function(err) {
        done(err);
    }); 
});

describe('User functions', function() {
	it("should create a cat foo", function(done) {
		Cat.create({name: "foo"}, function(err, cat) {
            done(err);
		});
    });

    it("should find cat foo", function(done) {
    	Cat.findOne({name: "foo"}, function(err, cat) {
    		done(err);
    	});
    });

    it("should remove cat foo", function(done) {
    	Cat.remove({name: "foo"}, function(err, cat) {
    		done(err);
    	});
    });
});