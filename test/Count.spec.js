describe('Count Tests', function () {
    'use strict';

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
                expect(err).toBeFalsy();
                expect(models).toBeTruthy();
                SimpleModel.create(
                    {name: 'one', value: 'one'},
                    {name: 'one', value: 'two'},
                    {name: 'one', value: 'two'},
                    {name: 'two', value: 'one'},
                    {name: 'two', value: 'two'},
                    function (err, models) {
                        expect(err).toBeFalsy();
                        expect(models).toBeTruthy();
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
                expect(err).toBeNull();
                expect(count).toBe(5);
                done(err);
            });
        });

        it('Count the number of items in {query:query}', function (done) {
            SimpleModel.count({name: 'one'}, function (err, count) {
                expect(err).toBeNull();
                expect(count).toBe(3);
                done(err);
            });
        });

        it('Count the number of items if no object passed', function (done) {
            SimpleModel.count(function (err, count) {
                expect(err).toBeNull();
                expect(count).toBe(5);
                done(err);
            });
        });

        it('Model.count(function()) should NOT throw an error', function (done) {
            expect(function(){
                SimpleModel.count(console.error);
                done();
            }).not.toThrow();
        });
    });
});
