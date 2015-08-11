/*jshint expr: true*/
/*jshint -W079 */ //redefined expect
var expect = require('chai').expect;

describe('Mockgoose $INC Operation Tests', function () {
    'use strict';

    var mockgoose = require('../..');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.createConnection('mongodb://localhost/TestingDB');
    var IndexModel = require('./../models/IndexModel')(mongoose);

    beforeEach(function (done) {
        mockgoose.reset();
        IndexModel.create(
            {name: 'one', value: 3},
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

    describe('$inc', function () {

        it('Be able to increment a value', function (done) {
            IndexModel.findOneAndUpdate({name: 'one'}, {$inc: {value: 5}}, function (err, res) {
                expect(res.value).to.equal(8);
                done(err);
            });
        });

        it('Be able to decrement a value', function (done) {
            IndexModel.findOneAndUpdate({name: 'one'}, {$inc: {value: -5}}, function (err, res) {
                expect(res.value).to.equal(-2);
                done(err);
            });
        });

        it('Be able to update multiple values', function (done) {
            IndexModel.findOneAndUpdate({name: 'one'}, {$inc: {value: -5, increment: 5}}, function (err, res) {
                expect(res.value).to.equal(-2);
                expect(res.increment).to.equal(10);
                done(err);
            });
        });

    });
});
