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

    describe('$set', function () {

        it('sets values when inserting', function (done) {
            IndexModel.findOneAndUpdate({name: 'bar'}, { $set: {value: 8} }, { upsert: true, 'new': true }, function (err, res) {
                expect(res.value).toBe(8);
                done(err);
            });
        });

        it('sets values when updating', function (done) {
            IndexModel.findOneAndUpdate({name: 'foo'}, { $set: {value: 8} }, { upsert: true, 'new': true }, function (err, res) {
                expect(res.value).toBe(8);
                done(err);
            });
        });

    });
});
