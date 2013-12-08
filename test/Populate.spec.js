describe('Mockgoose Populate test', function () {
    'use strict';
    var async = require('async');

    var mockgoose = require('../Mockgoose');
    var Mongoose = require('mongoose');

    mockgoose(Mongoose);
    Mongoose.connect('mongodb://localhost:27017/TestingDB');

    var CompanyEntry = require('./models/ParentModel');
    var UserEntry = require('./models/ChildModel');

    beforeEach(function (done) {
        mockgoose.reset();

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
        ], function (err) {
            done(err);
        });
    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('Populate', function () {
        it('should find the childs within the parent', function (done) {
            CompanyEntry.findOne({name: 'Test Company'},function (err) {
                expect(err).toBeFalsy();

            }).populate('users').exec(function (err, result) {
                    expect(result.users.length).toBe(1);
                    done();
                });
        });

    });
});