/*jshint expr: true*/
/*jshint -W079 */ //redefined expect
var expect = require('chai').expect;

describe('Mockgoose $UNSET Operation Tests', function () {
	'use strict';

	var mockgoose = require('../..');
	var Mongoose = require('mongoose').Mongoose;
	var mongoose = new Mongoose();
	mockgoose(mongoose);
	mongoose.createConnection('mongodb://localhost/TestingDB');
	var SimpleModel = require('../models/SimpleModel')(mongoose);

	beforeEach(function (done) {
		mockgoose.reset();
		SimpleModel.create(
			{name: 'rex', value: 'hi', bool: true},
			function (err, models) {
				expect(err).not.to.be.ok;
				expect(models).to.be.ok;
				done(err);
			}
		);
	});

	afterEach(function (done) {
		//Reset the database after every test.
		mockgoose.reset();
		done();
	});

	describe('$unset', function () {

		it('Be able to ignore non-existent fields', function(done) {
			SimpleModel.findOneAndUpdate({name: 'rex'}, {$unset: {doesNotExist: ''}}, function(err, res) {
				expect(res.value).to.equal('hi');
				expect(res.bool).to.equal(true);
				done(err);
			});
		});

		it('Be able to unset a value', function(done) {
			SimpleModel.findOneAndUpdate({name: 'rex'}, {$unset: {value: ''}}, function(err, res) {
				expect(res.value).to.equal(undefined);
				done(err);
			});
		});

		it('Be able to unset multiple values', function(done) {
			SimpleModel.findOneAndUpdate({name: 'rex'}, {$unset: {value: '', bool: ''}}, function(err, res) {
				expect(res.value).to.equal(undefined);
				expect(res.bool).to.equal(undefined);
				done(err);
			});
		});
	});
});
