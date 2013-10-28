describe('Mockgoose Find Tests', function () {
    'use strict';

    var mockgoose = require('./../../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB');
    var AccountModel = require('./../models/AccountModel')(mongoose);
    var SimpleModel = require('./../models/SimpleModel')(mongoose);
    var IndexModel = require('./../models/IndexModel')(mongoose);

    var accountId;
    beforeEach(function (done) {
        mockgoose.reset();
        AccountModel.create(
            {email: 'valid@valid.com', password: 'password'},
            {email: 'invalid@invalid.com', password: 'password'},
            function (err, valid, invalid) {
                expect(err).toBeFalsy();
                expect(valid).toBeTruthy();
                accountId = valid._id;
                expect(invalid).toBeTruthy();
                SimpleModel.create(
                    {name: 'one', value: 'one'},
                    {name: 'one', value: 'two'},
                    {name: 'one', value: 'two'},
                    {name: 'two', value: 'one'},
                    {name: 'two', value: 'two'},
                    function (err, one, two, three) {
                        expect(err).toBeFalsy();
                        expect(one).toBeTruthy();
                        expect(two).toBeTruthy();
                        expect(three).toBeTruthy();
                        done(err);
                    }
                );
            });

    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('$in', function () {

        it('should be able to find a model $in', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: ['one', 'two']},
                {email: 'multiples@invalid.com', password: 'password', values: ['two', 'three']},
                function () {
                    AccountModel.findOne({values: {$in: ['three']}}, function (err, result) {
                        expect(result).toBeDefined();
                        if (result) {
                            expect(result.values[1]).toBe('three');
                            done(err);
                        } else {
                            done('Error finding model');
                        }
                    });
                });
        });

        it('should be able to find models $in with more than one value', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: ['one', 'two']},
                {email: 'multiples@invalid.com', password: 'password', values: ['two', 'three']},
                function () {
                    AccountModel.find({values: {$in: ['two']}}, function (err, result) {
                        expect(result).toBeDefined();
                        if (result) {
                            expect(result.length).toBe(2);
                            done(err);
                        } else {
                            done('Error finding models');
                        }
                    });
                });
        });

        it('should be able to find models $in with multiple values', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: ['one', 'two']},
                {email: 'multiples@invalid.com', password: 'password', values: ['two', 'three']},
                function () {
                    AccountModel.find({values: {$in: ['two', 'three']}}, function (err, result) {
                        expect(result).toBeDefined();
                        if (result) {
                            expect(result.length).toBe(2);
                            done(err);
                        } else {
                            done('Error finding models');
                        }
                    });
                });
        });
    });
});