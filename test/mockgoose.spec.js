describe('Mockgoose Tests', function () {
    "use strict";

    var mockgoose = require('../Mockgoose');
    var mongoose = require('mongoose');
    mockgoose(mongoose);
    mongoose.createConnection('mongodb://localhost:3001/TestingDB');
    var AccountModel = require('./models/AccountModel')(mongoose);
    var SimpleModel = require('./models/SimpleModel')(mongoose);

    beforeEach(function (done) {
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

    it('should be able to require mockgoose', function () {
        expect(mockgoose).toBeTruthy();
    });

    it('should be able to create and save test model', function (done) {
        AccountModel.create({email: 'email@email.com', password: 'supersecret'}, function (err, model) {
            expect(err).toBeFalsy();
            expect(model).toBeTruthy();
            done(err);
        });
    });

    it('should be able to invoke validator on a test model', function (done) {
        //Email needs to be unique!
        AccountModel.create({email: 'valid@valid.com', password: 'supersecret'}, function (err, model) {
            expect(err).toBeTruthy();
            expect(model).toBeFalsy();
            done();
        });

    });

    it('should be able to call custom save pre', function (done) {
        AccountModel.create({email: 'newemail@valid.com', password: 'password'}, function (err, model) {
            //Custom pre save should encrypt the users password.
            expect(model.password).not.toBe('password');
            model.validPassword('password', function (err, success) {
                expect(success).toBeTruthy();
                expect(err).toBeFalsy();
                done(err);
            });

        });
    });

    it('should be able to create multiple items in one go', function (done) {
        AccountModel.create({email: 'one@one.com', password: 'password'},
            {email: 'two@two.com', password: 'password'}, function (err, one, two) {
                expect(err).toBeFalsy();
                expect(one).toBeTruthy();
                expect(two).toBeTruthy();
                done(err);
            });
    });

    it('should be able to find an item by id', function (done) {
        AccountModel.create({email: 'one@one.com', password: 'password'},
            {email: 'two@two.com', password: 'password'}, function (err, one, two) {
                expect(err).toBeFalsy();
                AccountModel.findById(two._id, function (err, model) {
                    expect(err).toBeFalsy();
                    expect(model._id.toString()).toBe(two._id.toString());
                    done(err);
                });
            });
    });

    it('should be able to find an item by id', function (done) {
        AccountModel.create({email: 'one@one.com', password: 'password'},
            {email: 'two@two.com', password: 'password'}, function (err, one, two) {
                expect(err).toBeFalsy();
                AccountModel.findById(two._id, function (err, model) {
                    expect(err).toBeFalsy();
                    expect(model._id.toString()).toBe(two._id.toString());
                    done(err);
                });
            });
    });

    it('should be able to findOne model by using a simple query', function (done) {
        AccountModel.findOne({email: 'valid@valid.com'}, function (err, model) {
            expect(err).toBeFalsy();
            expect(model.email).toBe('valid@valid.com');
            done(err);
        });
    });

    it('should be able to findOne model by using a slightly complex query', function (done) {
        SimpleModel.findOne({name: 'one', value: 'two'}, function (err, model) {
            expect(err).toBeFalsy();
            expect(model.name).toBe('one');
            expect(model.value).toBe('two');
            done(err);
        });
    });

    xit('should be able to find multiple model by using a simple query', function () {
        expect(false).toBeTruthy();
    });

    xit('should be able to find multiple model by using a slightly complex query', function () {
        expect(false).toBeTruthy();
    });

    xit('should be able to find all models of a certain type', function (done) {
        SimpleModel.findAll(function (err, models) {
            expect(err).toBeFalsy();
            expect(models.length).toBe(3);
            done(err);
        });
    });

    xit('should be able to remove a model', function () {
        expect(false).toBeTruthy();
    });

});