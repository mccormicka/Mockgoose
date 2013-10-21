describe('Mockgoose Remove Tests', function () {
    'use strict';

    var mockgoose = require('../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB');
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
        it('should be able to remove a model', function (done) {
            SimpleModel.remove({name: 'one'}, function (err) {
                expect(err).toBeFalsy();
                SimpleModel.findOne({name: 'one'}, function (err, model) {
                    expect(err).toBeFalsy();
                    expect(model).toBeFalsy();
                    done(err);
                });
            });
        });

        it('should be able to remove a model from a model object', function (done) {
            SimpleModel.find({name: 'one'}, function (err, result) {
                expect(err).toBeFalsy();
                expect(result.length).toBe(3);
                result[0].remove(function (err) {
                    expect(err).toBeFalsy();
                    SimpleModel.find({name: 'one'}, function (err, models) {
                        expect(err).toBeFalsy();
                        expect(models.length).toBe(2);
                        done(err);
                    });
                });
            });
        });

        it('should be able to remove multiple model', function (done) {
            AccountModel.remove({email: 'valid@valid.com'}, function (err) {
                expect(err).toBeFalsy();
                AccountModel.findOne({email: 'valid@valid.com'}, function (err, model) {
                    expect(err).toBeFalsy();
                    expect(model).toBeFalsy();
                    done(err);
                });
            });
        });
    });
});