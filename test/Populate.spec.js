/*jshint expr: true*/
/*jshint -W079 */ //redefined expect
var expect = require('chai').expect;

describe('Mockgoose Populate test', function () {
    'use strict';
    var async = require('async');

    var mockgoose = require('..');
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
                        if (err) {
                            callback(err);
                        }
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
        it('should find the children objects within the parent', function (done) {
            CompanyEntry.findOne({name: 'Test Company'},function (err) {
                expect(err).not.to.be.ok;

            }).populate('users').exec(function (err, result) {
                    expect(result.users.length).to.equal(1);
                    var isInstanceOfUserEntry = result.users[0] instanceof UserEntry;
                    expect(isInstanceOfUserEntry).to.be.true;
                    done();
                });
        });

        it('should not find children objects within the parent on subsequent non populate calls', function(done) {
            async.waterfall([function(callback) {
                CompanyEntry.findOne({name: 'Test Company'})
                    .populate('users')
                    .exec(callback);
            }, function(result, callback) {
                CompanyEntry.findOne({name: 'Test Company'}, callback);
            }, function(result) {
                expect(result.users.length).to.equal(1);
                var isInstanceOfObjectId = result.users[0] instanceof Mongoose.Types.ObjectId;
                expect(isInstanceOfObjectId).to.be.true;
                done();
            }]);
        });

    });
});
