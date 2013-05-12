describe('Mockgoose Tests', function () {
    "use strict";

    var mockgoose = require('../Mockgoose');
    var mongoose = require('mongoose');
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost:3001/TestingDB');
    var TestModel = require('./TestModel')(mongoose);

    beforeEach(function () {
        TestModel.create({email: 'valid@valid.com', password: 'password'}, function(err, model){});
    });

    afterEach(function () {
        //Reset the database after every test.
        mockgoose.reset();
    });

    it('should be able to require mockgoose', function () {
        expect(mockgoose).toBeTruthy();
    });
    it('should be able to create a test model', function (done) {
        TestModel.create({email: 'email@email.com', password: 'supersecret'}, function (err, model) {
            expect(err).toBeFalsy();
            expect(model).toBeTruthy();
            done(err);
        });
    });

    it('should be able to invoke validator on a test model', function (done) {
        //Email needs to be unique!
        TestModel.create({email: 'valid@valid.com', password: 'supersecret'}, function (err, model) {
            expect(err).toBeTruthy();
            expect(model).toBeFalsy();
            done();
        });

    });

    it('should be able to call custom save pre', function () {
        expect(false).toBeTruthy();
    });

    it('should be able to find an item by id', function () {

    });

});