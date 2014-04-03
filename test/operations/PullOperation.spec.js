describe('Mockgoose Update Tests', function () {
    'use strict';

    var mockgoose = require('../../../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB');
    var AccountModel = require('./../models/AccountModel')(mongoose);
    var CompanyEntry = require('./../models/ParentModel');
    var UserEntry = require('./../models/ChildModel');
    var async = require('async');

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

    describe('$pull', function () {

        it('should be able to pull items from nested documents array', function (done) {
            AccountModel.create(
                {email: 'tester@valid.com', password: 'password', values: ['one', 'two']},
                function () {
                    AccountModel.findOneAndUpdate({email: 'tester@valid.com'}, {$pull: {values: 'one'}}, function (err, result) {
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

        it('should be able to pull items that are ObjectIds from nested documents array', function (done) {
            async.waterfall([
                function (callback) {
                    CompanyEntry.create({
                        name: 'Test Company',
                        contact: {
                            email: 'hello@example.com',
                            address: 'Hoperoad 7'
                        }
                    }, function (err, company) {
                        callback(err, company);
                    });
                } , function (company, callback) {
                    UserEntry.create({
                        name: 'Max Mustermann',
                        username: 'max',
                        email: 'max@example.com',
                        company: company._id
                    }, function (err, user) {
                        company.users.push(user._id);
                        company.save(function (err, company) {
                            user.company = company._id;
                            user.save();
                            callback(err, company, user);
                        });
                    });
                }
            ], function (err, result) {
                CompanyEntry.findOneAndUpdate({name: 'Test Company'}, {$pull: {users: result.users[0]}}, function (err, result) {
                    expect(err).toBeFalsy();
                    expect(result.users.length).toBe(0);

                    done();
                });
            });
        });

        it('should be able to pull items from nested documents array by property', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: [
                    {name: 'one'},
                    {name: 'two'}
                ]},
                function () {
                    AccountModel.findOneAndUpdate({email: 'multiples@valid.com'}, {$pull: {values: {name: {$in: ['one']}}}}, function (err, result) {
                        expect(result).toBeDefined();
                        if (result) {
                            expect(result.values.length).toBe(1);
                            if (result.values.length === 1) {
                                expect(result.values[0].name).toBe('two');
                                done(err);
                            } else {
                                done('Invalid value length', result.values);
                            }
                        } else {
                            done('Error finding models');
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
                    AccountModel.findOneAndUpdate({email: 'multiples@valid.com'}, {$pull: {values: {name: {$in: ['one', 'two']}}}}, function (err, result) {
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