describe('Mockgoose $UNSET Operation Tests', function () {
	'use strict';

	var mockgoose = require('../../Mockgoose');
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
				expect(err).toBeFalsy();
				expect(models).toBeTruthy();
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
				expect(res.value).toBe('hi');
				expect(res.bool).toBe(true);
				done(err);
			});
		});

		it('Be able to unset a value', function(done) {
			SimpleModel.findOneAndUpdate({name: 'rex'}, {$unset: {value: ''}}, function(err, res) {
				expect(res.value).toBe(undefined);
				done(err);
			});
		});

		it('Be able to unset multiple values', function(done) {
			SimpleModel.findOneAndUpdate({name: 'rex'}, {$unset: {value: '', bool: ''}}, function(err, res) {
				expect(res.value).toBe(undefined);
				expect(res.bool).toBe(undefined);
				done(err);
			});
		});
	});
});