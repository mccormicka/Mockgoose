describe('Mockgoose $exists Tests', function () {
    'use strict';

    var mockgoose = require('./../../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB');

    var Schema = new mongoose.Schema({
        name: String,
        email: String
    });
    var Model = mongoose.model('AllTests', Schema);

    beforeEach(function (done) {
        mockgoose.reset();
        Model.create({
                name: 'abc'
            },
            {
                name: 'cde',
                user: {
                    email: 'test@test.com'
                }
            },
            {
                name: 'fgh',
                email: 'test2@test.com'
            }, function (err) {
                done(err);
            });
    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('$exists Tests', function () {

        it('Be able to match only one item with truthful $exists', function (done) {
            Model.find({
                email: { $exists: true }
            }).exec().then(function (results) {
                    expect(results).toBeDefined();
                    expect(results.length).toBe(1);
                    done();
                }, done);
        });

        it('Be able to match only one item with deep truthful $exists', function (done) {
            Model.find({
                user: { email: { $exists: true } }
            }).exec().then(function (results) {
                    expect(results).toBeDefined();
                    expect(results.length).toBe(1);
                    done();
                }, done);
        });

        it('Be able to match two items with false $exists', function (done) {
            Model.find({
                email: { $exists: false }
            }).exec().then(function (results) {
                    expect(results).toBeDefined();
                    expect(results.length).toBe(2);
                    done();
                }, done);
        });
    });

    describe('$exists mongodb examples', function () {
        var Records = mongoose.model('Records', new mongoose.Schema({
            order:Number,
            a: Number,
            b: Number,
            c: Number
        }));

        beforeEach(function (done) {
            Records.create(
                { order: 0, a: 5, b: 5, c: null },
                { order: 1, a: 3, b: null, c: 8 },
                { order: 2, a: null, b: 3, c: 9 },
                { order: 3, a: 1, b: 2, c: 3 },
                { order: 4, a: 2, c: 5 },
                { order: 5, a: 3, b: 2 },
                { order: 6, a: 4 },
                { order: 7, b: 2, c: 4 },
                { order: 8, b: 2 },
                { order: 9, c: 6 }, done);
        });

        it('a exists', function (done) {
            Records.find({ a: { $exists: true } }).exec().then(function (results) {
                expect(results.length).toBe(7);
                var expected = [
                    { order: 0, a: 5, b: 5, c: null },
                    { order: 1, a: 3, b: null, c: 8 },
                    { order: 2, a: null, b: 3, c: 9 },
                    { order: 3, a: 1, b: 2, c: 3 },
                    { order: 4, a: 2, c: 5 },
                    { order: 5, a: 3, b: 2 },
                    { order: 6, a: 4 }
                ];
                assertResults(results, expected);
                done();
            });
        });

        it('b does not exists', function (done) {
            Records.find({ b: { $exists: false } }).exec().then(function (results) {
                expect(results.length).toBe(3);
                var expected = [
                    { order: 4, a: 2, c: 5 },
                    { order: 6, a: 4 },
                    { order: 9, c: 6 }
                ];
                assertResults(results, expected);
                done();
            });
        });

        it('c does not exists', function (done) {
            Records.find({ c: { $exists: false } }).exec().then(function (results) {
                expect(results.length).toBe(3);
                var expected = [
                    { order: 5, a: 3, b: 2 },
                    { order: 6, a: 4 },
                    { order: 8, b: 2 }
                ];
                assertResults(results, expected);
                done();
            });
        });


        //-------------------------------------------------------------------------
        //
        // Private Methods
        //
        //-------------------------------------------------------------------------
        function assertResults(results, expected) {
            expected = expected.sort(orderSort);
            var resultSet = toResultSet(results);
            for (var i = 0; i < expected.length; i++) {
                expect(resultSet[i]).toEqual(expected[i]);
            }
        }

        function orderSort(a, b) {
            if (a.order > b.order) {
                return 1;
            }
            if (a.order < b.order) {
                return -1;
            }
            return 0;
        }

        function toResultSet(results) {
            var items = [];

            function extractValue(result, resultItem, value) {
                if (result[value] || result[value] === null || result[value] === 0) {
                    resultItem[value] = result[value];
                }
            }

            results.forEach(function (result) {
                var resultItem = {};
                extractValue(result, resultItem, 'order');
                extractValue(result, resultItem, 'a');
                extractValue(result, resultItem, 'b');
                extractValue(result, resultItem, 'c');
                items.push(resultItem);
            });
            return items.sort(orderSort);
        }
    });
});
