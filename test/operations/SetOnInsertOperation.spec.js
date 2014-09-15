describe('Mockgoose $setOnInsert Operation Tests', function () {
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

    describe('$setOnInsert', function () {

        it('sets values when inserting', function (done) {
            IndexModel.findOneAndUpdate({name: 'bar'}, { $setOnInsert: {value: 8} }, { 'upsert': true, 'new': true }, function (err, res) {
                expect(res.value).toBe(8);
                done(err);
            });
        });

        it('does not set values when updating', function (done) {
            IndexModel.findOneAndUpdate({name: 'foo'}, { $setOnInsert: {value: 8} }, { 'upsert': true, 'new': true }, function (err, res) {
                expect(res.value).toBe(3);
                done(err);
            });
        });

    });
});
