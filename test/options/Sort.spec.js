describe('Mockgoose Find Tests', function () {
    'use strict';

    var mockgoose = require('./../../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB');
    var SimpleModel = require('./../models/SimpleModel')(mongoose);
    var IndexModel = require('./../models/IndexModel')(mongoose);

    var accountId;
    beforeEach(function (done) {
        mockgoose.reset();
        done();
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

        it('Be able to sort items by field in ascending order Date', function(done) {
            SimpleModel.create({name: 'one', date: new Date(1000)}, {name: 'two', date: new Date(2000)}, function (err, results) {
                expect(err).toBeNull();
                expect(results).toBeDefined();
                if (results) {
                    SimpleModel.findOne({}, {}, {sort: {date: 1}}, function (err, model) {
                        expect(err).toBeNull();
                        expect(model).toBeDefined();
                        if (model) {
                            expect(model.name).toBe('one');
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

        it('Be able to sort items by field in descending order Date', function(done) {
            SimpleModel.create({name: 'one', date: new Date(1000)}, {name: 'two', date: new Date(2000)}, function (err, results) {
                expect(err).toBeNull();
                expect(results).toBeDefined();
                if (results) {
                    SimpleModel.findOne({}, {}, {sort: {date: -1}}, function (err, model) {
                        expect(err).toBeNull();
                        expect(model).toBeDefined();
                        if (model) {
                            expect(model.name).toBe('two');
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