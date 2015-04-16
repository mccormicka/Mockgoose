/*jshint expr: true*/
/*jshint -W079 */ //redefined expect
var expect = require('chai').expect;

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
                expect(err).not.to.be.ok;
                expect(models).to.be.ok;
                done(err);
            });
    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('$pushAll', function () {

        it('should be able to use $push with a static update', function (done) {
            AccountModel.create({email: 'pushed@pushed.com', password: 'password', values: [
                    {name: 'one'},
                    {name: 'two'},
                    {name: 'three'}
                ]},
                function (err, result) {
                    expect(err).not.to.be.ok;
                    expect(result).not.to.be.undefined;
                    if (result) {
                        AccountModel.update({email: 'pushed@pushed.com'}, {$pushAll: {values: [{name: 'pushed'}]}}, function (err, result) {
                            expect(err).not.to.be.ok;
                            expect(result).to.equal(1);
                            if (result) {
                                AccountModel.findOne({email: 'pushed@pushed.com'}, function (err, pushed) {
                                    expect(err).not.to.be.ok;
                                    if (pushed) {
                                        expect(pushed.values[3]).to.deep.equal({name: 'pushed'});
                                        done(err);
                                    } else {
                                        done('Error finding model');
                                    }
                                });
                            } else {
                                done('Error updating model with $pushAll');
                            }
                        });
                    } else {
                        done('Error creating model');
                    }
                });
        });

        it('should be able to use $pushAll with a update', function (done) {
            AccountModel.create({email: 'pushed@pushed.com', password: 'password', values: [
                    {name: 'one'},
                    {name: 'two'},
                    {name: 'three'}
                ]},
                function (err, result) {
                    expect(err).not.to.be.ok;
                    expect(result).not.to.be.undefined;
                    if (result) {
                        result.update({$pushAll: {values: [{name: 'pushed'}, {name: 'last'}]}}, function (err, result) {
                            expect(err).not.to.be.ok;
                            expect(result).to.equal(1);
                            if (result) {
                                AccountModel.findOne({email: 'pushed@pushed.com'}, function (err, pushed) {
                                    expect(err).not.to.be.ok;
                                    if (pushed) {
                                        expect(pushed.values.length).to.equal(5);
                                        expect(pushed.values[3]).to.deep.equal({name: 'pushed'});
                                        expect(pushed.values[4]).to.deep.equal({name: 'last'});
                                        expect(pushed.values[2]).to.deep.equal({name: 'three'});
                                        done(err);
                                    } else {
                                        done('Error finding model');
                                    }
                                });
                            } else {
                                done('Error updating model with $pushAll');
                            }
                        });
                    } else {
                        done('Error creating model');
                    }
                });
        });

        it('should be able to use $pushAll with a multi 0  update', function (done) {
            AccountModel.create({email: 'aaa@pushed.com', password: 'password', values: ['one', 'two', 'three']},
                function (err, result) {
                    expect(err).not.to.be.ok;
                    expect(result).not.to.be.undefined;
                    if (result) {
                        AccountModel.update({}, {$pushAll: {values: ['pushed']}}, {multi: 0, sort: {email: 1}}, function (err, result) {
                            expect(err).not.to.be.ok;
                            expect(result).to.equal(1);
                            if (result) {
                                AccountModel.find({values: {$in: ['pushed']}}, function (err, pushed) {
                                    expect(err).not.to.be.ok;
                                    if (pushed) {
                                        expect(pushed.length).to.equal(1);
                                        expect(pushed[0].values).to.contain('pushed');
                                        done(err);
                                    } else {
                                        done('Error finding model');
                                    }
                                });
                            } else {
                                done('Error updating model with $pushAll');
                            }
                        });
                    } else {
                        done('Error creating model');
                    }
                });
        });

        it('should be able to use $pushAll with a multi 1  update', function (done) {
            AccountModel.create({email: 'pushed@pushed.com', password: 'password', values: ['one', 'two', 'three']},
                function (err, result) {
                    expect(err).not.to.be.ok;
                    expect(result).not.to.be.undefined;
                    if (result) {
                        AccountModel.update({}, {$pushAll: {values: ['pushed']}}, {multi: 1}, function (err, result) {
                            expect(err).not.to.be.ok;
                            expect(result).to.equal(3);
                            if (result) {
                                AccountModel.find({values: {$in: ['pushed']}}, function (err, pushed) {
                                    expect(err).not.to.be.ok;
                                    if (pushed) {
                                        expect(pushed.length).to.equal(3);
                                        if (pushed.length === 3) {
                                            expect(pushed[2].values).to.contain('pushed');
                                            done(err);
                                        } else {
                                            done('error finding pushed items!' + pushed);
                                        }

                                    } else {
                                        done('Error finding model');
                                    }
                                });
                            } else {
                                done('Error updating model with $pushAll');
                            }
                        });
                    } else {
                        done('Error creating model');
                    }
                });
        });
    });

});
