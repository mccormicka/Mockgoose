describe('Mockgoose Update Tests', function () {
    'use strict';

    var mockgoose = require('../../../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost:27017/TestingDB');
    var AccountModel = require('./../models/AccountModel')(mongoose);

    beforeEach(function (done) {
        mockgoose.reset();
        AccountModel.create(
            {email: 'valid@valid.com', password: 'password'},
            {email: 'invalid@invalid.com', password: 'password'},
            function (err, models) {
                expect(err).toBeFalsy();
                expect(models).toBeTruthy();
                done(err);
            });

    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('$pullAll', function () {

        it('should be able to pull items from nested documents array', function (done) {
            AccountModel.create(
                {email: 'tester@valid.com', password: 'password', values: ['one', 'two']},
                function () {
                    AccountModel.findOneAndUpdate({email: 'tester@valid.com'}, {$pullAll: {values: ['one']}}, function (err, result) {
                        expect(result).toBeDefined();
                        if (result) {
                            expect(result.values.length).toBe(1);
                            expect(result.values[0]).toBe('two');
                            done(err);
                        } else {
                            done('Error finding item');
                        }
                    });
                });
        });

        it('should be able to pull multiple items from nested documents array by property', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: [
                    {name: 'one'},
                    {name: 'two'},
                    {name: 'three'}
                ]},
                function () {
                    AccountModel.findOneAndUpdate({email: 'multiples@valid.com'}, {$pullAll: {values: [{name:'one'},{name:'two'}]}}, function (err, result) {
                        expect(result).toBeDefined();
                        if (result) {
                            expect(result.values.length).toBe(1);
                            if (result.values.length === 1) {
                                expect(result.values[0].name).toBe('three');
                                done(err);
                            } else {
                                done('invalid values length');
                            }
                        } else {
                            done('Error finding models');
                        }
                    });
                });
        });
    });

});