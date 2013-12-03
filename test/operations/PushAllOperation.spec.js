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

    describe('$pushAll', function () {

        it('should be able to use $push with a static update', function (done) {
            AccountModel.create({email: 'pushed@pushed.com', password: 'password', values: [
                    {name: 'one'},
                    {name: 'two'},
                    {name: 'three'}
                ]},
                function (err, result) {
                    expect(err).toBeNull();
                    expect(result).toBeDefined();
                    if (result) {
                        AccountModel.update({email: 'pushed@pushed.com'}, {$pushAll: {values: [{name: 'pushed'}]}}, function (err, result) {
                            expect(err).toBeNull();
                            expect(result).toBe(1);
                            if (result) {
                                AccountModel.findOne({email: 'pushed@pushed.com'}, function (err, pushed) {
                                    expect(err).toBeNull();
                                    if (pushed) {
                                        expect(pushed.values[3]).toEqual({name: 'pushed'});
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
                    expect(err).toBeNull();
                    expect(result).toBeDefined();
                    if (result) {
                        result.update({$pushAll: {values: [{name: 'pushed'}, {name: 'last'}]}}, function (err, result) {
                            expect(err).toBeNull();
                            expect(result).toBe(1);
                            if (result) {
                                AccountModel.findOne({email: 'pushed@pushed.com'}, function (err, pushed) {
                                    expect(err).toBeNull();
                                    if (pushed) {
                                        expect(pushed.values.length).toBe(5);
                                        expect(pushed.values[3]).toEqual({name: 'pushed'});
                                        expect(pushed.values[4]).toEqual({name: 'last'});
                                        expect(pushed.values[2]).toEqual({name: 'three'});
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
                    expect(err).toBeNull();
                    expect(result).toBeDefined();
                    if (result) {
                        AccountModel.update({}, {$pushAll: {values: ['pushed']}}, {multi: 0, sort: {email: 1}}, function (err, result) {
                            expect(err).toBeNull();
                            expect(result).toBe(1);
                            if (result) {
                                AccountModel.find({values: {$in: ['pushed']}}, function (err, pushed) {
                                    expect(err).toBeNull();
                                    if (pushed) {
                                        expect(pushed.length).toBe(1);
                                        expect(pushed[0].values).toContain('pushed');
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
                    expect(err).toBeNull();
                    expect(result).toBeDefined();
                    if (result) {
                        AccountModel.update({}, {$pushAll: {values: ['pushed']}}, {multi: 1}, function (err, result) {
                            expect(err).toBeNull();
                            expect(result).toBe(3);
                            if (result) {
                                AccountModel.find({values: {$in: ['pushed']}}, function (err, pushed) {
                                    expect(err).toBeNull();
                                    if (pushed) {
                                        expect(pushed.length).toBe(3);
                                        if (pushed.length === 3) {
                                            expect(pushed[2].values).toContain('pushed');
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