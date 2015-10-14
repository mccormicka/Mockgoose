/*jshint expr: true*/
/*jshint -W079 */ //redefined expect
var expect = require('chai').expect;

describe('Mockgoose $size Tests', function () {
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
            }
        ]
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
                ]
            },
            {
                _id: 2,
                zipcode: 63110,
                students: [
                    { name: 'ajax', school: 100, age: 7 },
                    { name: 'achilles', school: 100, age: 8 }
                ]
            },
            {
                _id: 3,
                zipcode: 63109,
                students: [
                    { name: 'ajax', school: 100, age: 7 },
                    { name: 'achilles', school: 100, age: 8 }
                ]
            },
            {
                _id: 4,
                zipcode: 63109,
                students: [
                    { name: 'barney', school: 102, age: 7 }
                ]
            },
            {
                _id: 5,
                zipcode: 63109,
                students: [
                ]
            }, function (err) {
                done(err);
            });
    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('$size Tests', function () {
        it('Be able to match a value for $size', function (done) {
            Model.find({ students: { $size: 1 } }).exec().then(function (results) {
                    expect(results).not.to.be.undefined;
                    expect(results.length).to.equal(1);
                    expect(results[0].students.length).to.equal(1);
                    expect(results[0].students[0].name).to.equal('barney');
                    done();
                }, done);
        });
        it('Be able to match multiple values for $size', function (done) {
            Model.find({ students: { $size: 2 } }).exec().then(function (results) {
                    expect(results).not.to.be.undefined;
                    expect(results.length).to.equal(2);
                    expect(results[0].students.length).to.equal(2);
                    expect(results[1].students.length).to.equal(2);
                    done();
                }, done);
        });
        it('Be able to match empty array for $size', function (done) {
            Model.find({ students: { $size: 0 } }).exec().then(function (results) {
                    expect(results).not.to.be.undefined;
                    expect(results.length).to.equal(1);
                    expect(results[0]._id).to.equal(5);
                   done();
                }, done);
        });
        it('Should not match properties that are not arrays for $size', function (done) {
            Model.find({ zipcode: { $size: 0 } }).exec()
                .then(function (err) {
                    done(err);
                }, function(err) {
                    expect(err).not.to.be.undefined;
                    done();
                }, done);
        });
    });
});
