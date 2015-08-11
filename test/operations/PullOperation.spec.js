/*jshint expr: true*/
/*jshint -W079 */ //redefined expect
'use strict';

var mockgoose = require('../../');
var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();
mockgoose(mongoose);
var AccountModel = require('./../models/AccountModel')(mongoose);
// var CompanyEntry = require('./../models/ParentModel');
// var UserEntry = require('./../models/ChildModel');
// var async = require('async');
var expect = require('chai').expect;

describe('Mockgoose Update Tests', function () {

    before(function(done) {
        mongoose.connect('mongodb://localhost/TestingDB', function(err) {
            done(err);
        });
    });

    describe('$pull', function () {

        beforeEach(function (done) {
            mockgoose.reset();
            AccountModel.create(
                {email: 'valid@valid.com', password: 'password'},
                {email: 'invalid@invalid.com', password: 'password'},
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

        it('should be able to pull items from nested documents array', function (done) {
            AccountModel.create(
                {email: 'tester@valid.com', password: 'password', values: ['one', 'two']},
                function () {
                    AccountModel.findOneAndUpdate({email: 'tester@valid.com'}, {$pull: {values: 'one'}}, function (err, result) {
                        expect(result).not.to.be.undefined;
                        if (result) {
                            expect(result.values.length).to.equal(1);
                            expect(result.values[0]).to.equal('two');
                            done(err);
                        } else {
                            done('Error finding item');
                        }
                    });
                }
            );
        });

                    /*
        it('should be able to pull items that are ObjectIds from nested documents array', function (done) {
            async.waterfall([
                function (callback) {
                    debugger;
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
                    expect(err).not.to.be.ok;
                    expect(result.users.length).to.equal(0);
                    done();
                });
            });
        });
            */

        it('should be able to pull items from nested documents array by property', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: [
                    {name: 'one'},
                    {name: 'two'}
                ]},
                function () {
                    AccountModel.findOneAndUpdate({email: 'multiples@valid.com'}, {$pull: {values: {name: {$in: ['one']}}}}, function (err, result) {
                        expect(result).not.to.be.undefined;
                        if (result) {
                            expect(result.values.length).to.equal(1);
                            if (result.values.length === 1) {
                                expect(result.values[0].name).to.equal('two');
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
                        expect(result).not.to.be.undefined;
                        if (result) {
                            expect(result.values.length).to.equal(1);
                            if (result.values.length === 1) {
                                expect(result.values[0].name).to.equal('three');
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
