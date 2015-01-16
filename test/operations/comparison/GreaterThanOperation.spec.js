describe('Mockgoose $gt Tests', function () {
    'use strict';

    var mockgoose = require('./../../../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB');

    var Schema = new mongoose.Schema({
        code: String,
        tags: [
            {type: String}
        ],
        qty: [
            {
                size: String,
                num: Number,
                color: String
            }
        ],
        summary: {
            total: Number
        }
    });
    var Model = mongoose.model('AllTests', Schema);

    beforeEach(function (done) {
        mockgoose.reset();
        Model.create({
                code: 'xyz',
                tags: [ 'school', 'book', 'bag', 'headphone', 'appliance' ],
                qty: [
                    { size: 'S', num: 10, color: 'blue' },
                    { size: 'M', num: 45, color: 'blue' },
                    { size: 'L', num: 100, color: 'green' }
                ],
                summary: {
                    total: 155
                }
            },
            {
                code: 'abc',
                tags: [ 'appliance', 'school', 'book' ],
                qty: [
                    { size: '6', num: 100, color: 'green' },
                    { size: '6', num: 50, color: 'blue' },
                    { size: '8', num: 100, color: 'brown' }
                ],
                summary: {
                    total: 250
                }
            },
            {
                code: 'efg',
                tags: [ 'school', 'book' ],
                qty: [
                    { size: 'S', num: 10, color: 'blue' },
                    { size: 'M', num: 100, color: 'blue' },
                    { size: 'L', num: 100, color: 'green' }
                ],
                summary: {
                    total: 210
                }
            },
            {
                code: 'ijk',
                tags: [ 'electronics', 'school' ],
                qty: [
                    { size: 'M', num: 30, color: 'green' }
                ],
                summary: {
                    total: 30
                }
            }, function (err) {
                done(err);
            });
    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('$gt Tests', function () {

        it('Be able to match values $gt', function (done) {
            Model.find({
                qty: { num: { $gt: 50 } }
            }).exec().then(function (results) {
                    expect(results).toBeDefined();
                    expect(results.length).toBe(3);
                    done();
                }, done);
        });

        it('Not match values $gt the value', function (done) {
            Model.find({ qty: { num: { $gt: 500 } }
            }).exec().then(function (results) {
                    expect(results).toBeDefined();
                    expect(results.length).toBe(0);
                    done();
                }, done);
        });

        it('Be able to match dot notation values contained within list $gt', function (done) {
            Model.find({
                'qty.num': { $gt: 50 }
            }).exec().then(function (results) {
                    expect(results).toBeDefined();
                    expect(results.length).toBe(3);
                    done();
                }, done);
        });

        it('Not match dot notation values contained within list $gt the value', function (done) {
            Model.find({
                'qty.num': { $gt: 500 }
            }).exec().then(function (results) {
                    expect(results).toBeDefined();
                    expect(results.length).toBe(0);
                    done();
                }, done);
        });

        it('Be able to match dot notation values contained within list $gt', function (done) {
            Model.find({
                'summary.total': { $gt: 200 }
            }).exec().then(function (results) {
                    expect(results).toBeDefined();
                    expect(results.length).toBe(2);
                    done();
                }, done);
        });

        it('Not match dot notation values contained within list $gt the value', function (done) {
            Model.find({
                'summary.total': { $gt: 500 }
            }).exec().then(function (results) {
                    expect(results).toBeDefined();
                    expect(results.length).toBe(0);
                    done();
                }, done);
        });

        it('Be able to match nested values not in list $gt', function (done) {
            Model.find({
                summary: {total: { $gt: 200 } }
            }).exec().then(function (results) {
                    expect(results).toBeDefined();
                    expect(results.length).toBe(2);
                    done();
                }, done);
        });

        it('Not match nested values not in list $gt the value', function (done) {
            Model.find({
                summary: {total: { $gt: 500 } }
            }).exec().then(function (results) {
                    expect(results).toBeDefined();
                    expect(results.length).toBe(0);
                    done();
                }, done);
        });

        it('Be able to match dot notation nested values not in list $gt', function (done) {
            Model.find({
                'summary.total': { $gt: 200 }
            }).exec().then(function (results) {
                    expect(results).toBeDefined();
                    expect(results.length).toBe(2);
                    done();
                }, done);
        });

        it('Not match dot notation nested values not in list $gt the value', function (done) {
            Model.find({
                'summary.total': { $gt: 500 }
            }).exec().then(function (results) {
                    expect(results).toBeDefined();
                    expect(results.length).toBe(0);
                    done();
                }, done);
        });
    });
});
