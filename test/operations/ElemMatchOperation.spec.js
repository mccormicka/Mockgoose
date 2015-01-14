describe('Mockgoose $elemMatch Tests', function () {
    'use strict';

    var mockgoose = require('./../../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB');

    var Schema = new mongoose.Schema({
        _id: Number,
        zipcode: Number,
        students: [
            {
                name: String,
                school: Number,
                age: Number
            },
        ],
        values: [Number]
    });
    var Model = mongoose.model('AllTests', Schema);

    beforeEach(function (done) {
        mockgoose.reset();
        Model.create({
                _id: 1,
                zipcode: 63109,
                students: [
                    { name: 'john', school: 102, age: 10 },
                    { name: 'jess', school: 102, age: 11 },
                    { name: 'jeff', school: 108, age: 15 }
                ],
            values: [1, 2, 3]
            },
            {
                _id: 2,
                zipcode: 63110,
                students: [
                    { name: 'ajax', school: 100, age: 7 },
                    { name: 'achilles', school: 100, age: 8 }
                ],
                values: [2, 3]
            },
            {
                _id: 3,
                zipcode: 63109,
                students: [
                    { name: 'ajax', school: 100, age: 7 },
                    { name: 'achilles', school: 100, age: 8 }
                ],
                values: [3, 4, 5]
            },
            {
                _id: 4,
                zipcode: 63109,
                students: [
                    { name: 'barney', school: 102, age: 7 }
                ],
                values: [9]
            }, function (err) {
                done(err);
            });
    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('$elemMatch Tests', function () {

        it('Be able to match values $elemMatch', function (done) {
            Model.find({ zipcode: 63109 },
                { students: { $elemMatch: { school: 102 } } }).exec().then(function (results) {
                    expect(results).toBeDefined();
                    expect(results.length).toBe(3);
                    expect(results[0].students.length).toBe(1);
                    expect(results[0].students[0].name).toBe('john');
                    expect(results[1].students.length).toBe(0);
                    expect(results[2].students[0].name).toBe('barney');
                    done();
                }, done);
        });

        it('Be able to match multiple values $elemMatch', function (done) {
            Model.find( { zipcode: 63109 },
                { students: { $elemMatch: { school: 102, age: { $gt: 10} } } } ).exec().then(function (results) {
                    expect(results).toBeDefined();
                    expect(results.length).toBe(3);
                    expect(results[0].students.length).toBe(1);
                    expect(results[0].students[0].name).toBe('jess');
                    done();
                }, done);
        });

        it('should be able to query for a field match in an array', function(done) {
            Model.find({ students: { $elemMatch: { name: 'ajax' } } }).exec().then(function(results) {
                expect(results).toBeDefined();
                expect(results.length).toBe(2);
                expect(results[0]._id).toBe(2);
                expect(results[1]._id).toBe(3);
                done();
            });
        });

        it('should be able to query for a value match in an array', function(done) {
            Model.find({ values: { $elemMatch: { $gt: 3 } } }).exec().then(function(results) {
                expect(results).toBeDefined();
                expect(results.length).toBe(2);
                expect(results[0]._id).toBe(3);
                expect(results[1]._id).toBe(4);
                done();
            });
        });

        it('should be able to query for an $in match in an array', function(done) {
            Model.find({ values: { $elemMatch: { $in: [1, 2] } } }).exec().then(function(results) {
                expect(results).toBeDefined();
                expect(results.length).toBe(2);
                expect(results[0]._id).toBe(1);
                expect(results[1]._id).toBe(2);
                done();
            });
        });

        it('should be able to query for a $nin match in an array', function(done) {
            Model.find({ values: { $elemMatch: { $nin: [2, 3] } } }).exec().then(function(results) {
                expect(results).toBeDefined();
                expect(results.length).toBe(3);
                expect(results[0]._id).toBe(1);
                expect(results[1]._id).toBe(3);
                expect(results[2]._id).toBe(4);
                done();
            });
        });
    });
});
