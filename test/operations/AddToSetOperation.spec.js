describe('Mockgoose $addToSet Tests', function () {
    'use strict';

    var mockgoose = require('./../../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB');
    var AccountModel = require('./../models/AccountModel')(mongoose);

    beforeEach(function (done) {
        mockgoose.reset();
        AccountModel.create(
            {email: 'valid@valid.com', password: 'password', values: [1, 2]},
            function (err) {
                done(err);
            });

    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('$addToSet', function () {

        it('Be able to a value to the set', function (done) {
            AccountModel.findOneAndUpdate({email: 'valid@valid.com'}, {$addToSet: {values: 3}}, function (err, res) {
                expect(res.values.toString()).toEqual([1,2,3].toString());
                done(err);
            });
        });

        it('NOT Be able to add a DUPLICATE value to the set', function (done) {
            AccountModel.findOneAndUpdate({email: 'valid@valid.com'}, {$addToSet: {values: 2}}, function (err, res) {
                expect(res.values.toString()).toBe([1,2].toString());
                done(err);
            });
        });

        it('$each NOT add items from array that are DUPLICATE ', function (done) {
            AccountModel.findOneAndUpdate({email: 'valid@valid.com'}, {$addToSet: {values: {$each:[1,2,3,4,5]}}}, function (err, res) {
                expect(res.values.toString()).toBe([1,2, 3, 4, 5].toString());
                done(err);
            });
        });
    });
});