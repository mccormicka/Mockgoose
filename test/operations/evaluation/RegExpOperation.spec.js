describe('Mockgoose $regex Tests', function () {
    'use strict';

    var mockgoose = require('./../../../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB');

    var Schema = new mongoose.Schema({
        field: String
    });
    var Model = mongoose.model('AllTests', Schema);

    beforeEach(function (done) {
        mockgoose.reset();
        Model.create(
            {
                field: 'Acme Corporation'
            }, {
                field: 'acme corporation'
            }, {
                field: 'acmecorporation'
            }, {
                field: 'acmeblahcorp'
            }, {
                field: 'My Corporation'
            }
        ).then(function () {
                done();
            });
    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('$regexp Tests', function () {

        it('$regexp case insensitive', function (done) {
            Model.find({ field: /acme.*corp/i }).exec().then(function (results) {
                expect(results.length).toBe(4);
                done();
            });
        });

        it('$regexp with RegeExp Object', function (done) {
            Model.find({ field: new RegExp(/acme.*corp/i) }).exec().then(function (results) {
                expect(results.length).toBe(4);
                done();
            });
        });

        it('$regexp case insensitive options', function (done) {
            Model.find({ field: { $regex: 'acme.*corp', $options: 'i' } }).exec().then(function (results) {
                expect(results.length).toBe(4);
                done();
            });
        });

        it('$regexp case sensitive options', function (done) {
            Model.find({ field: { $regex: 'acme.*corp'} }).exec().then(function (results) {
                expect(results.length).toBe(3);
                done();
            });
        });

        it('$regexp with $nin', function (done) {
            Model.find({ field: { $regex: /acme.*corp/i, $nin: [ 'acmeblahcorp' ] } }).exec().then(function (results) {
                expect(results.length).toBe(3);
                done();
            });
        });
    });
});
