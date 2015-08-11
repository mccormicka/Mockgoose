/*jshint expr: true*/
/*jshint -W079 */ //redefined expect
var expect = require('chai').expect;

describe('Mockgoose Query Tests', function () {
    'use strict';

    var mockgoose = require('..');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB');
    var AccountModel = require('./models/AccountModel')(mongoose);
    var SimpleModel = require('./models/SimpleModel')(mongoose);

    var accountId;
    beforeEach(function (done) {
        mockgoose.reset();
        AccountModel.create(
            {email: 'valid@valid.com', password: 'password'},
            {email: 'invalid@invalid.com', password: 'password'},
            function (err, valid, invalid) {
                expect(err).not.to.be.ok;
                expect(valid).to.be.ok;
                accountId = valid._id;
                expect(invalid).to.be.ok;
                SimpleModel.create(
                    {name: 'one', value: 'one'},
                    {name: 'one', value: 'two'},
                    {name: 'one', value: 'two'},
                    {name: 'two', value: 'one'},
                    {name: 'two', value: 'two'},
                    function (err, one, two, three) {
                        expect(err).not.to.be.ok;
                        expect(one).to.be.ok;
                        expect(two).to.be.ok;
                        expect(three).to.be.ok;
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

    describe('Find', function () {

        it('should return a mongoose Query object', function () {
            expect(SimpleModel.find({}) instanceof mongoose.Query).to.be.ok;
        });

        it('should be able to call exec ', function (done) {
            AccountModel.create({email: 'one@one.com', password: 'password'},
                {email: 'two@two.com', password: 'password'}, function (err, one, two) {
                    expect(err).not.to.be.ok;
                    expect(two).not.to.be.undefined;
                    if (two) {
                        AccountModel.findById(two._id).exec(function (err, model) {
                            expect(err).not.to.be.ok;
                            if (model) {
                                expect(model._id.toString()).to.equal(two._id.toString());
                                done(err);
                            } else {
                                done('Unable to find model by ID');
                            }
                        });
                    } else {
                        done('Error creating items' + err + one + two);
                    }
                });
        });
    });

    describe('findById', function () {
        it('should return a mongoose Query object', function () {
            expect(SimpleModel.findById({}) instanceof mongoose.Query).to.be.ok;
        });

        it('should be able to call exec ', function (done) {
            AccountModel.findById(accountId).exec(function (err, model) {
                expect(err).not.to.be.ok;
                expect(model.email).to.equal('valid@valid.com');
                done(err);
            });
        });
    });

    describe('findByIdAndRemove', function () {

        it('should return a mongoose Query object', function () {
            expect(SimpleModel.findByIdAndRemove({}) instanceof mongoose.Query).to.be.ok;
        });

        it('Be able to call exec', function (done) {
            SimpleModel.create(
                {name: 'one', value: 'one'}, function (err, result) {
                    SimpleModel.findByIdAndRemove(result._id).exec(function (err, removed) {
                        expect(err).not.to.be.ok;
                        if (removed) {
                            expect(removed._id.toString()).to.equal(result._id.toString());
                            SimpleModel.findOne({id: result._id}, function (err, item) {
                                expect(item).to.be.null;
                                done(err);
                            });
                        }
                        else {
                            done('Error removing item!');
                        }
                    });
                });
        });
    });

    describe('findByIdAndUpdate', function () {

        it('should return a mongoose Query object', function () {
            expect(SimpleModel.findByIdAndUpdate({}) instanceof mongoose.Query).to.be.ok;
        });

        it('should be able to call exec ', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: ['one', 'two']},
                function (err, result) {
                    var id = result._id;
                    AccountModel.findByIdAndUpdate(id, {email: 'updatedemail@email.com'}).exec(function (err, result) {
                        expect(result).not.to.be.undefined;
                        if (result) {
                            expect(result.email).to.equal('updatedemail@email.com');
                            done(err);
                        } else {
                            done('Error finding models');
                        }
                    });
                });
        });
    });

    describe('findOne', function () {

        it('should return a mongoose Query object', function () {
            expect(SimpleModel.findOne({}) instanceof mongoose.Query).to.be.ok;
        });

        it('should be able to call exec ', function (done) {
            AccountModel.findOne({email: 'valid@valid.com'}).exec(function (err, model) {
                expect(err).not.to.be.ok;
                expect(model.email).to.equal('valid@valid.com');
                done(err);
            });
        });

    });

    describe('findOneAndRemove', function () {

        it('should return a mongoose Query object', function () {
            expect(SimpleModel.findOneAndRemove({}) instanceof mongoose.Query).to.be.ok;
        });

        it('should be able to call exec ', function (done) {
            SimpleModel.create(
                {name: 'unique', value: 'one'}, function (err, result) {
                    SimpleModel.findOneAndRemove({name: 'unique'}).exec(function (err, removed) {
                        expect(err).not.to.be.ok;
                        if (removed) {
                            expect(removed._id.toString()).to.equal(result._id.toString());
                            SimpleModel.findOne({id: result._id}, function (err, item) {
                                expect(item).to.be.null;
                                done(err);
                            });
                        }
                        else {
                            done('Error removing item!');
                        }
                    });
                });
        });

    });

    describe('findOneAndUpdate', function () {

        it('should return a mongoose Query object', function () {
            expect(SimpleModel.findOneAndUpdate({}) instanceof mongoose.Query).to.be.ok;
        });

        it('should be able to call exec ', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: ['one', 'two']},
                function () {
                    AccountModel.findOneAndUpdate({email: 'multiples@valid.com'}, {email: 'updatedemail@email.com'})
                        .exec(function (err, result) {
                            expect(result).not.to.be.undefined;
                            if (result) {
                                expect(result.email).to.equal('updatedemail@email.com');
                                done(err);
                            } else {
                                done('Error finding models');
                            }
                        });
                });
        });

    });
});
