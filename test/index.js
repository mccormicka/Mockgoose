var should = require('chai').should();
var expect = require('chai').expect;

var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();

var mockgoose = require('../Mockgoose');

var Cat = mongoose.model('Cat', { name: String });

mockgoose(mongoose);

// FIXME: patiently wait for mongod to shut down
//   or else we can't guarantee :27017 across tests
var FIXME_INTER_TEST_DELAY = 1000;


before(function(done) {
    mongoose.connect('mongodb://127.0.0.1:27017/TestingDB', function(err) {
        done(err);
    });
});
after(function(done) {
    setTimeout(done, FIXME_INTER_TEST_DELAY);
});

describe('User functions', function() {
    it("isMocked", function(done) {
		expect(mongoose.isMocked).to.be.true;
		done();
    });
	it("should create a cat foo", function(done) {
		Cat.create({name: "foo"}, function(err, cat) {
			expect(err).to.be.falsy;
            done(err);
		});
    });

    it("should find cat foo", function(done) {
    	Cat.findOne({name: "foo"}, function(err, cat) {
			expect(err).to.be.falsy;
    		done(err);
    	});
    });

    it("should remove cat foo", function(done) {
    	Cat.remove({name: "foo"}, function(err, cat) {
			expect(err).to.be.falsy;
    		done(err);
    	});
    });

    it("reset", function(done) {
    	mockgoose.reset(function() {
    		done();
    	});
    });

	it("unmock", function(done) {
		mongoose.unmock(function() {
			done();
		});
	});

	if ( process.env.MOCKGOOSE_LIVE ) {
		it("unmockAndReconnect", function(done) {
			mongoose.unmockAndReconnect(function(err) {
				expect(mongoose.isMocked).to.be.undefined;
				expect(err).to.be.falsy;
				done(err);
			});
		});
	}

});
