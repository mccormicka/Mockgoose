describe('Mockgoose Limit Tests', function () {
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

    describe('Limit', function () {
        it('Be able to not use limit at all', function (done) {
            SimpleModel.find({}, function (err, data) {
                expect(err).toBeNull();
                expect(data).toBeDefined();
                expect(Array.isArray(data)).toBe(true);
                expect(data.length).toBe(10);
                done();
            });
        });

        it('Be able to limit 0 items (same as no limit)', function (done) {
            SimpleModel.find({}, null, {limit: 0}, function (err, data) {
                expect(err).toBeNull();
                expect(data).toBeDefined();
                expect(Array.isArray(data)).toBe(true);
                expect(data.length).toBe(10);
                done();
            });
        });

        it('Be able to limit n elements', function (done) {
            async.parallel([
                function (done) {
                    SimpleModel.find({}, null, {limit: 5}, function (err, data) {
                        expect(err).toBeNull();
                        expect(data).toBeDefined();
                        expect(Array.isArray(data)).toBe(true);
                        expect(data.length).toBe(5);
                        done(err);
                    });
                },

                function (done) {
                    SimpleModel.find({}, null, {limit: 1}, function (err, data) {
                        expect(err).toBeNull();
                        expect(data).toBeDefined();
                        expect(Array.isArray(data)).toBe(true);
                        expect(data.length).toBe(1);
                        done(err);
                    });
                },

                function (done) {
                    SimpleModel.find({}, null, {limit: 11}, function (err, data) {
                        expect(err).toBeNull();
                        expect(data).toBeDefined();
                        expect(Array.isArray(data)).toBe(true);
                        expect(data.length).toBe(10);
                        done(err);
                    });
                }

            ], function (err) {
                done(err);
            });
        });

        it('Should be able to call limit on the query object', function (done) {
            SimpleModel.find({}).limit(5).exec().then(function(data){
                expect(data).toBeDefined();
                expect(Array.isArray(data)).toBe(true);
                expect(data.length).toBe(5);
                done();
            });
        });
    });
});
