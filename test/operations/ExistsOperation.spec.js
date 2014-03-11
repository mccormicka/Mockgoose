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
});
