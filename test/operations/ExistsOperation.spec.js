/*jshint expr: true*/
/*jshint -W079 */ //redefined expect
 'use strict';
var expect = require('chai').expect;
var mockgoose = require('./../../Mockgoose');
var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();
mockgoose(mongoose);


var Schema = new mongoose.Schema({
    name: String,
    email: String
});
var Model = mongoose.model('AllTests', Schema);

describe('Mockgoose $exists Tests', function () {

    before(function(done) {
        mongoose.connect('mongodb://localhost/TestingDB', function(err) {
            if (err) {
                    console.log(err);
            }
            done(err);
        });
    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('$exists Tests', function () {
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
                    if ( err ) {
                        console.log(err);
                    }
                    done(err);
                });
        });

        it('Be able to match only one item with truthful $exists', function (done) {
            Model.find({
                email: { $exists: true }
            }).exec().then(function (results) {
                    expect(results).not.to.be.undefined;
                    expect(results.length).to.equal(1);
                    done();
                }, function(err) {
                    done(err);
                });
        });

        it('Be able to match only one item with deep truthful $exists', function (done) {
            Model.find({
                user: { email: { $exists: true } }
            }).exec().then(function (results) {
                    expect(results).not.to.be.undefined;
                    expect(results.length).to.equal(1);
                    done();
                }, function(err) {
                    done(err);
                });
        });

        it('Be able to match two items with false $exists', function (done) {
            Model.find({
                email: { $exists: false }
            }).exec().then(function (results) {
                    expect(results).not.to.be.undefined;
                    expect(results.length).to.equal(2);
                    done();
                }, function(err) {
                    done(err);
                });
        });
    });

    describe('$exists mongodb examples', function () {
        var Records;
        before(function(done) {
            Records = mongoose.model('Records', new mongoose.Schema({
                order:Number,
                a: Number,
                b: Number,
                c: Number
            }));
            done();
        });

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
                { order: 9, c: 6 }, function(err) {
                    done(err);
                });
        });

        it('a exists', function (done) {
            Records.find({ a: { $exists: true } }).exec().then(function (results) {
                expect(results.length).to.equal(7);
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
            }, function(err) {
                console.log('error', err);
                done(err);
            });
        });

        it('b does not exists', function (done) {
            Records.find({ b: { $exists: false } }).exec().then(function (results) {
                expect(results.length).to.equal(3);
                var expected = [
                    { order: 4, a: 2, c: 5 },
                    { order: 6, a: 4 },
                    { order: 9, c: 6 }
                ];
                assertResults(results, expected);
                done();
            }, function(err) {
                console.log(err);
                done(err);
            });
        });

        it('c does not exists', function (done) {
            Records.find({ c: { $exists: false } }).exec().then(function (results) {
                expect(results.length).to.equal(3);
                var expected = [
                    { order: 5, a: 3, b: 2 },
                    { order: 6, a: 4 },
                    { order: 8, b: 2 }
                ];
                assertResults(results, expected);
                done();
            }, function(err) {
                console.log(err);
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
                expect(resultSet[i]).to.deep.equal(expected[i]);
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
