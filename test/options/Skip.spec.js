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

    afterAll(function (done) {
        mockgoose.reset();
        done();
    });

    describe('Skip', function () {
        it('Be able to not use skip at all', function (done) {
            SimpleModel.find({}, function (err, data) {
                expect(err).toBeNull();
                expect(data).toBeDefined();
                expect(Array.isArray(data)).toBe(true);
                expect(data.length).toBe(10);
                done();
            });
        });

        it('Be able to skip 0 items (same as no skip)', function (done) {
            SimpleModel.find({}, null, {skip: 0}, function (err, data) {
                expect(err).toBeNull();
                expect(data).toBeDefined();
                expect(Array.isArray(data)).toBe(true);
                expect(data.length).toBe(10);
                done();
            });
        });

        it('Be able to skip n elements', function (done) {
            async.parallel([
                function (done) {
                    SimpleModel.find({}, null, {skip: 5}, function (err, data) {
                        expect(err).toBeNull();
                        expect(data).toBeDefined();
                        expect(Array.isArray(data)).toBe(true);
                        expect(data.length).toBe(5);
                        done(err);
                    });
                },

                function (done) {
                    SimpleModel.find({}, null, {skip: 9}, function (err, data) {
                        expect(err).toBeNull();
                        expect(data).toBeDefined();
                        expect(Array.isArray(data)).toBe(true);
                        expect(data.length).toBe(1);
                        done(err);
                    });
                },

                function (done) {
                    SimpleModel.find({}, null, {skip: 11}, function (err, data) {
                        expect(err).toBeNull();
                        expect(data).toBeDefined();
                        expect(Array.isArray(data)).toBe(true);
                        expect(data.length).toBe(0);
                        done(err);
                    });
                }

            ], function (err) {
                done(err);
            });
        });

        it('Should be able to call skip on the query object', function (done) {
            SimpleModel.find({}).skip(5).exec().then(function(data){
                expect(data).toBeDefined();
                expect(Array.isArray(data)).toBe(true);
                expect(data.length).toBe(5);
                done();
            });
        });
    });
});
