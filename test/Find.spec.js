describe('Mockgoose Find Tests', function () {
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

    describe('Find', function () {

        it('should be able to find an item by id', function (done) {
            AccountModel.create({email: 'one@one.com', password: 'password'},
                {email: 'two@two.com', password: 'password'}, function (err, one, two) {
                    expect(err).toBeFalsy();
                    expect(two).toBeDefined();
                    if (two) {
                        AccountModel.findById(two._id, function (err, model) {
                            expect(err).toBeFalsy();
                            if (model) {
                                expect(model._id.toString()).toBe(two._id.toString());
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

        it('should find all models if an empty {} object is passed to find', function (done) {
            SimpleModel.find({}, function (err, result) {
                expect(err).toBeFalsy();
                expect(result).toBeTruthy();
                if (result) {
                    expect(result.length).toBe(5);
                }
                done();
            });
        });

        it('should be able to find multiple model by using a simple query', function (done) {
            SimpleModel.find({name: 'one'}, function (err, models) {
                expect(err).toBeFalsy();
                expect(models.length).toBe(3);
                done(err);
            });
        });

        it('should be able to find multiple model by using a slightly complex query', function (done) {
            SimpleModel.find({name: 'one', value: 'two'}, function (err, models) {
                expect(err).toBeFalsy();
                expect(models.length).toBe(2);
                done(err);
            });
        });

        it('should be able to find all models of a certain type', function (done) {
            SimpleModel.find({}, function (err, models) {
                expect(err).toBeFalsy();
                expect(models.length).toBe(5);
                done(err);
            });
        });

    });

    describe('findOne', function () {

        it('should be able to findOne model by using a simple query', function (done) {
            AccountModel.findOne({email: 'valid@valid.com'}, function (err, model) {
                expect(err).toBeFalsy();
                expect(model.email).toBe('valid@valid.com');
                done(err);
            });
        });

        it('should be able to findOne model by using a slightly complex query', function (done) {
            SimpleModel.findOne({name: 'one', value: 'two'}, function (err, model) {
                expect(err).toBeFalsy();
                if (model) {
                    expect(model.name).toBe('one');
                    expect(model.value).toBe('two');
                    done(err);
                } else {
                    done('Error finding model' + err + model);
                }
            });
        });

        xit('Be able to pass a fields object to findOne', function (done) {
            SimpleModel.findOne({name: 'one'}, {name: 0, value: 1}, function (err, model) {
                expect(err).toBeFalsy();
                if (model) {
                    expect(model.name).toBeUndefined();
                    expect(model.value).toBe('two');
                    done(err);
                } else {
                    done('Error finding model' + err + model);
                }
            });
        });

        it('should match boolean values', function (done) {
            SimpleModel.create(
                {name: 'true', password: 'something', bool: true},
                {name: 'false', password: 'something', bool: false}, function () {

                    SimpleModel.findOne({bool: true}, function (err, result) {
                        if (result) {
                            expect(result.name).toBe('true');
                            SimpleModel.findOne({bool: false}, function (err, result) {
                                if (result) {
                                    expect(result.name).toBe('false');
                                    done(err);
                                } else {
                                    done('Unable to find' + err + result);
                                }
                            });
                        } else {
                            done('Unable to find' + err + result);
                        }

                    });
                });
        });

        it('should find a models if an empty {} object is passed to findOne', function (done) {
            SimpleModel.findOne({}, function (err, result) {
                expect(err).toBeFalsy();
                expect(result).toBeTruthy();
                if (result) {
                    expect(result.type).toBe('simple');
                }
                done();
            });
        });

    });

    describe('findOneAndUpdate', function () {
        it('should be able to findOneAndUpdate models', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: ['one', 'two']},
                function () {
                    AccountModel.findOneAndUpdate({email: 'multiples@valid.com'}, {email: 'updatedemail@email.com'}, function (err, result) {
                        expect(result).toBeDefined();
                        if (result) {
                            expect(result.email).toBe('updatedemail@email.com');
                            done(err);
                        } else {
                            done('Error finding models');
                        }
                    });
                });
        });

        it('should be able to findOneAndUpdate models and saved model changed', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: ['one', 'two']},
                function () {
                    AccountModel.findOneAndUpdate({email: 'multiples@valid.com'}, {email: 'updatedemails@email.com'}, function (err, result) {
                        expect(result).toBeDefined();
                        if (result) {
                            expect(result.email).toBe('updatedemails@email.com');
                        }
                        AccountModel.findOne({email: 'updatedemails@email.com'}, function (err, found) {
                            expect(found).toBeDefined();
                            done(err);
                        });
                    });
                });
        });

        it('should be able to findOneAndUpdate multiple values in models', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: ['one', 'two']},
                function () {
                    AccountModel.findOneAndUpdate({email: 'multiples@valid.com'}, {email: 'updatedemail@email.com', values: ['updated']}, function (err, result) {
                        expect(result).toBeDefined();
                        if (result) {
                            expect(result.email).toBe('updatedemail@email.com');
                            expect(result.values[0]).toEqual('updated');
                            done(err);
                        } else {
                            done('Error finding models');
                        }
                    });
                });
        });

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