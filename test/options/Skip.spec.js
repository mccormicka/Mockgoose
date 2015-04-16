/*jshint expr: true*/
/*jshint -W079 */ //redefined expect
var expect = require('chai').expect;

describe('Mockgoose Skip Tests', function () {
    'use strict';

    var async = require('async');
    var mockgoose = require('./../../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB');
    var SimpleModel = require('./../models/SimpleModel')(mongoose);


    beforeEach(function (done) {
        mockgoose.reset();
        async.times(10, function (n, next) {
            var model = new SimpleModel({
                name: n
            });
            model.save(next);
        }, done);
    });

    after(function (done) {
        mockgoose.reset();
        done();
    });

    describe('Skip', function () {
        it('Be able to not use skip at all', function (done) {
            SimpleModel.find({}, function (err, data) {
                expect(err).not.to.be.ok;
                expect(data).not.to.be.undefined;
                expect(Array.isArray(data)).to.equal(true);
                expect(data.length).to.equal(10);
                done();
            });
        });

        it('Be able to skip 0 items (same as no skip)', function (done) {
            SimpleModel.find({}, null, {skip: 0}, function (err, data) {
                expect(err).not.to.be.ok;
                expect(data).not.to.be.undefined;
                expect(Array.isArray(data)).to.equal(true);
                expect(data.length).to.equal(10);
                done();
            });
        });

        it('Be able to skip n elements', function (done) {
            async.parallel([
                function (done) {
                    SimpleModel.find({}, null, {skip: 5}, function (err, data) {
                        expect(err).not.to.be.ok;
                        expect(data).not.to.be.undefined;
                        expect(Array.isArray(data)).to.equal(true);
                        expect(data.length).to.equal(5);
                        done(err);
                    });
                },

                function (done) {
                    SimpleModel.find({}, null, {skip: 9}, function (err, data) {
                        expect(err).not.to.be.ok;
                        expect(data).not.to.be.undefined;
                        expect(Array.isArray(data)).to.equal(true);
                        expect(data.length).to.equal(1);
                        done(err);
                    });
                },

                function (done) {
                    SimpleModel.find({}, null, {skip: 11}, function (err, data) {
                        expect(err).not.to.be.ok;
                        expect(data).not.to.be.undefined;
                        expect(Array.isArray(data)).to.equal(true);
                        expect(data.length).to.equal(0);
                        done(err);
                    });
                }

            ], function (err) {
                done(err);
            });
        });

        it('Should be able to call skip on the query object', function (done) {
            SimpleModel.find({}).skip(5).exec().then(function(data){
                expect(data).not.to.be.undefined;
                expect(Array.isArray(data)).to.equal(true);
                expect(data.length).to.equal(5);
                done();
            });
        });
    });
});
