describe('Mockgoose Update Tests', function () {
    'use strict';

    var mockgoose = require('../Mockgoose');
    var mongoose = require('mongoose');
    mockgoose(mongoose);
    mongoose.createConnection('mongodb://localhost:3001/TestingDB');
    var AccountModel = require('./models/AccountModel')(mongoose);
    var SimpleModel = require('./models/SimpleModel')(mongoose);

    beforeEach(function (done) {
        mockgoose.reset();
        AccountModel.create(
            {email: 'valid@valid.com', password: 'password'},
            {email: 'invalid@invalid.com', password: 'password'},
            function (err, models) {
                expect(err).toBeFalsy();
                expect(models).toBeTruthy();
                SimpleModel.create(
                    {name: 'one', value: 'one'},
                    {name: 'one', value: 'two'},
                    {name: 'one', value: 'two'},
                    {name: 'two', value: 'one'},
                    {name: 'two', value: 'two'},
                    function (err, models) {
                        expect(err).toBeFalsy();
                        expect(models).toBeTruthy();
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

    describe('Update', function () {
        it('should be able to update items', function (done) {
            AccountModel.create({email: 'testing@testing.com', password: 'password', values: ['one', 'two']}, function (err, model) {
                expect(model).toBeDefined();
                if (model) {
                    AccountModel.update({email: 'testing@testing.com'}, {email: 'updated@testing.com'}, function (err, result) {
                        expect(result).toBe(1);
                        AccountModel.findOne({email: 'updated@testing.com'}, function (err, result) {
                            if (result) {
                                expect(result.email).toBe('updated@testing.com');
                                done(err);
                            } else {
                                done('Error finding models');
                            }
                        });
                    });
                } else {
                    done(err);
                }
            });
        });

        it('Have the same _id after doing an update', function (done) {
            AccountModel.create({email: 'testing@testing.com', password: 'password', values: ['one', 'two']}, function (err, model) {
                expect(model).toBeDefined();
                if (model) {
                    model.update({email: 'updated@testing.com'}, function (err, result) {
                        expect(result).toBe(1);
                        AccountModel.findOne({_id: model._id}, function (err, result) {
                            expect(result).toBeDefined();
                            if (result) {
                                expect(result.email).toBe('updated@testing.com');
                            }
                            done(err);
                        });
                    });
                } else {
                    done(err);
                }

            });
        });
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

    describe('$push', function () {

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
                        AccountModel.update({email: 'pushed@pushed.com'}, {$push: {values: {name: 'pushed'}}}, function (err, result) {
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
                                done('Error updating model with $push');
                            }
                        });
                    } else {
                        done('Error creating model');
                    }
                });
        });

        it('should be able to use $push with a update', function (done) {
            AccountModel.create({email: 'pushed@pushed.com', password: 'password', values: [
                    {name: 'one'},
                    {name: 'two'},
                    {name: 'three'}
                ]},
                function (err, result) {
                    expect(err).toBeNull();
                    expect(result).toBeDefined();
                    if (result) {
                        result.update({$push: {values: {name: 'pushed'}}}, function (err, result) {
                            expect(err).toBeNull();
                            expect(result).toBe(1);
                            if (result) {
                                AccountModel.findOne({email: 'pushed@pushed.com'}, function (err, pushed) {
                                    expect(err).toBeNull();
                                    if (pushed) {
                                        expect(pushed.values.length).toBe(4);
                                        expect(pushed.values[3]).toEqual({name: 'pushed'});
                                        done(err);
                                    } else {
                                        done('Error finding model');
                                    }
                                });
                            } else {
                                done('Error updating model with $push');
                            }
                        });
                    } else {
                        done('Error creating model');
                    }
                });
        });

        it('should be able to use $push with an $each', function (done) {
            AccountModel.create({email: 'pushed@pushed.com', password: 'password', values: [
                    {name: 'one'},
                    {name: 'two'},
                    {name: 'three'}
                ]},
                function (err, result) {
                    expect(err).toBeNull();
                    expect(result).toBeDefined();
                    if (result) {
                        result.update({$push: {values: {$each: [
                            {name: 'pushed'},
                            {name: 'pushed2'}
                        ]}}}, function (err, result) {
                            expect(err).toBeNull();
                            expect(result).toBe(1);
                            if (result) {
                                AccountModel.findOne({email: 'pushed@pushed.com'}, function (err, pushed) {
                                    expect(err).toBeNull();
                                    if (pushed) {
                                        expect(pushed.values.length).toBe(5);
                                        expect(pushed.values[4]).toEqual({name: 'pushed2'});
                                        done(err);
                                    } else {
                                        done('Error finding model');
                                    }
                                });
                            } else {
                                done('Error updating model with $push');
                            }
                        });
                    } else {
                        done('Error creating model');
                    }
                });
        });

        it('should be able to use $push with a multi 0  update', function (done) {
            AccountModel.create({email: 'pushed@pushed.com', password: 'password', values: ['one', 'two', 'three']},
                function (err, result) {
                    expect(err).toBeNull();
                    expect(result).toBeDefined();
                    if (result) {
                        AccountModel.update({}, {$push: {values: 'pushed'}}, {multi: 0}, function (err, result) {
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
                                done('Error updating model with $push');
                            }
                        });
                    } else {
                        done('Error creating model');
                    }
                });
        });

        it('should be able to use $push with a multi 1  update', function (done) {
            AccountModel.create({email: 'pushed@pushed.com', password: 'password', values: ['one', 'two', 'three']},
                function (err, result) {
                    expect(err).toBeNull();
                    expect(result).toBeDefined();
                    if (result) {
                        AccountModel.update({}, {$push: {values: 'pushed'}}, {multi: 1}, function (err, result) {
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
                                done('Error updating model with $push');
                            }
                        });
                    } else {
                        done('Error creating model');
                    }
                });
        });
    });


    describe('upsert', function () {

        it('should be able to findOneAndUpdate with an upsert', function (done) {
            SimpleModel.findOneAndUpdate({name: 'upsert'}, {name: 'upsert'}, {upsert: true}, function (err, result) {
                expect(err).toBeFalsy();
                expect(result).toBeTruthy();
                if (result) {
                    expect(result.name).toBe('upsert');
                    SimpleModel.findOne({name: 'upsert'}, function (err, result) {
                        expect(err).toBeFalsy();
                        expect(result).toBeTruthy();
                        if (result) {
                            expect(result.name).toBe('upsert');
                            done(err);
                        } else {
                            done('Unable to find ' + err + result);
                        }
                    });
                } else {
                    done(err);
                }
            });
        });
    });
});