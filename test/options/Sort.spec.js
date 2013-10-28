describe('Mockgoose Find Tests', function () {
    'use strict';

    var mockgoose = require('./../../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB');
    var AccountModel = require('./../models/AccountModel')(mongoose);
    var SimpleModel = require('./../models/SimpleModel')(mongoose);
    var IndexModel = require('./../models/IndexModel')(mongoose);

    var accountId;
    beforeEach(function (done) {
        mockgoose.reset();
        AccountModel.create(
            {email: 'valid@valid.com', password: 'password'},
            {email: 'invalid@invalid.com', password: 'password'},
            function (err, valid, invalid) {
                expect(err).toBeFalsy();
                expect(valid).toBeTruthy();
                accountId = valid._id;
                expect(invalid).toBeTruthy();
                SimpleModel.create(
                    {name: 'one', value: 'one'},
                    {name: 'one', value: 'two'},
                    {name: 'one', value: 'two'},
                    {name: 'two', value: 'one'},
                    {name: 'two', value: 'two'},
                    function (err, one, two, three) {
                        expect(err).toBeFalsy();
                        expect(one).toBeTruthy();
                        expect(two).toBeTruthy();
                        expect(three).toBeTruthy();
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

    describe('Sort', function () {

        it('Be able to sort items by field in ascending order Numeric', function (done) {
            IndexModel.create({name: 'zzz', value: 1}, {name: 'aaa', value: 2}, function (err, results) {
                expect(err).toBeNull();
                expect(results).toBeDefined();
                if (results) {
                    IndexModel.findOne({}, {}, {sort: {value: 1}}, function (err, model) {
                        expect(err).toBeNull();
                        expect(model).toBeDefined();
                        if (model) {
                            expect(model.name).toBe('zzz');
                            expect(model.value).toBe(1);
                            done(err);
                        } else {
                            done('Error finding models');
                        }
                    });
                } else {
                    done('Error creating Models!');
                }
            });
        });

        it('Be able to sort items by field in descending order Numeric', function (done) {
            IndexModel.create({name: 'zzz', value: 1}, {name: 'aaa', value: 2}, function (err, results) {
                expect(err).toBeNull();
                expect(results).toBeDefined();
                if (results) {
                    IndexModel.findOne({}, {}, {sort: {value: -1}}, function (err, model) {
                        expect(err).toBeNull();
                        expect(model).toBeDefined();
                        if (model) {
                            expect(model.name).toBe('aaa');
                            expect(model.value).toBe(2);
                            done(err);
                        } else {
                            done('Error finding models');
                        }
                    });
                } else {
                    done('Error creating Models!');
                }

            });
        });

        it('Be able to sort items by field in ascending order Alpha', function (done) {
            IndexModel.create({name: 'zzz', value: 1}, {name: 'aaa', value: 2}, function (err, results) {
                expect(err).toBeNull();
                expect(results).toBeDefined();
                if (results) {
                    IndexModel.findOne({}, {}, {sort: {name: 1}}, function (err, model) {
                        expect(err).toBeNull();
                        expect(model).toBeDefined();
                        if (model) {
                            expect(model.name).toBe('aaa');
                            expect(model.value).toBe(2);
                            done(err);
                        } else {
                            done('Error finding models');
                        }
                    });
                } else {
                    done('Error creating Models!');
                }
            });
        });

        it('Be able to sort items by field in descending order Alpha', function (done) {
            IndexModel.create({name: 'zzz', value: 1}, {name: 'aaa', value: 2}, function (err, results) {
                expect(err).toBeNull();
                expect(results).toBeDefined();
                if (results) {
                    IndexModel.findOne({}, {}, {sort: {name: -1}}, function (err, model) {
                        expect(err).toBeNull();
                        expect(model).toBeDefined();
                        if (model) {
                            expect(model.name).toBe('zzz');
                            expect(model.value).toBe(1);
                            done(err);
                        } else {
                            done('Error finding models');
                        }
                    });
                } else {
                    done('Error creating Models!');
                }
            });
        });

    });
});