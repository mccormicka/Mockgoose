/*jshint expr: true*/
/*jshint -W079 */ //redefined expect
var expect = require('chai').expect;

describe('Mockgoose $set Operation Tests', function () {
    'use strict';

    var mockgoose = require('../../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.createConnection('mongodb://localhost/TestingDB');
    var IndexModel = require('./../models/IndexModel')(mongoose);

    beforeEach(function (done) {
        mockgoose.reset();
        IndexModel.create(
            {name: 'foo', value: 3},
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

    describe('$set', function () {

        it('sets values when inserting', function (done) {
            IndexModel.findOneAndUpdate({name: 'bar'}, { $set: {value: 8} }, { upsert: true, 'new': true }, function (err, res) {
                expect(res.value).to.equal(8);
                done(err);
            });
        });

        it('sets values when updating', function (done) {
            IndexModel.findOneAndUpdate({name: 'foo'}, { $set: {value: 8} }, { upsert: true, 'new': true }, function (err, res) {
                expect(res.value).to.equal(8);
                done(err);
            });
        });

    });
});
