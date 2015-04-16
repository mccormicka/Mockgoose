/*jshint expr: true*/
/*jshint -W079 */ //redefined expect
'use strict';
var expect = require('chai').expect;

describe('Count Tests', function () {

    var mockgoose = require('../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost:27017/TestingDB');
    var AccountModel = require('./models/AccountModel')(mongoose);
    var SimpleModel = require('./models/SimpleModel')(mongoose);

    beforeEach(function (done) {
        mockgoose.reset();
        AccountModel.create(
            {email: 'valid@valid.com', password: 'password'},
            {email: 'invalid@invalid.com', password: 'password'},
            function (err, models) {
                expect(err).not.to.be.ok;
                expect(models).to.be.ok;
                SimpleModel.create(
                    {name: 'one', value: 'one'},
                    {name: 'one', value: 'two'},
                    {name: 'one', value: 'two'},
                    {name: 'two', value: 'one'},
                    {name: 'two', value: 'two'},
                    function (err, models) {
                        expect(err).not.to.be.ok;
                        expect(models).to.be.ok;
                        done(err);
                    }
                );
            });
    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('SHOULD', function () {
        it('Count the number of items in a {} query', function (done) {
            SimpleModel.count({}, function (err, count) {
                expect(err).not.to.be.ok;
                expect(count).to.equal(5);
                done(err);
            });
        });

        it('Count the number of items in {query:query}', function (done) {
            SimpleModel.count({name: 'one'}, function (err, count) {
                expect(err).not.to.be.ok;
                expect(count).to.equal(3);
                done(err);
            });
        });

        it('Count the number of items if no object passed', function (done) {
            SimpleModel.count(function (err, count) {
                expect(err).not.to.be.ok;
                expect(count).to.equal(5);
                done(err);
            });
        });

        it('Have an error when mongoose is disconnected', function (done) {
            mockgoose.setMockReadyState(mongoose.connection, 0);

            SimpleModel.count({}, function (err, count) {
                expect(err).not.to.be.undefined;
                expect(count).to.be.undefined;
                mockgoose.setMockReadyState(mongoose.connection, 1);
                done();
            });
        });

        it('Model.count(function()) should NOT throw an error', function (done) {
            expect(function(){
                SimpleModel.count(done);
            }).not.to.throw();
        });

    });

    describe('Bugs', function () {
        it('#48 Count operation is throwing an except https://github.com/mccormicka/Mockgoose/issues/48', function (done) {
            expect(function(){
                SimpleModel.count({name:'one'}, function(){
                    done();
                });
            }).not.to.throw();
        });
    });
});
