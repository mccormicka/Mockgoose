'use strict';

require('chai').should();
var expect = require('chai').expect;
var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();
var Mockgoose = require('../built/mockgoose').Mockgoose;
var mockgoose = new Mockgoose(mongoose);

var Cat = mongoose.model('Cat', {
    name: String
});

describe('issue 179', function() {
    before(function(done) {
		mockgoose.prepareStorage().then(function() {
        	mongoose.connect('mongodb://127.0.0.1:27017/TestingDB', { useNewUrlParser: true }, function(err) {
        	    done(err);
        	});
		});
    });

    beforeEach(function(done) {
        mockgoose.helper.reset().then(function() {
            done();
        });
    });

    it("should create a cat foo", function(done) {
        Cat.create({
            name: "foo"
        }, function(err) {
            expect(err).not.to.be.ok;
            done(err);
        });
    });

    it("should NOT find cat foo", function(done) {
        Cat.findOne({
            name: "foo"
        }, function(err, cat) {
            expect(err).not.to.be.ok;
            expect(cat).to.be.null;
            done(err);
        });
    });
});
