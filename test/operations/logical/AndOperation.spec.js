describe('Mockgoose $and Tests', function () {
    'use strict';

    var mockgoose = require('./../../../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB77');

    var Schema = new mongoose.Schema({
        price: Number,
        qty: Number,
        sale: Boolean
    });
    var Model = mongoose.model('AllTests', Schema);

    beforeEach(function (done) {
        mockgoose.reset();
        Model.create(
            {
                price: 1.99,
                qty: 21,
                sale: true
            },
            {
                price: 1.99,
                qty: 21,
                sale: true
            },
            {
                price: 1.99,
                qty: 19,
                sale: true
            },
            {
                price: 1.99,
                qty: 21,
                sale: false
            }, {
                price: 1,
                qty: 21,
                sale: false
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

    describe('$and Tests', function () {

        it('Find values that match $and operation', function (done) {
            Model.find({ $and: [
                { price: 1.99 },
                { qty: { $gt: 20 } },
                { sale: true }
            ] }).exec().then(function (results) {
                    expect(results.length).toBe(2);
                    done();
                });
        });

        it('Find values that match implicit $and operation', function (done) {
            Model.find({ price: 1.99, qty: { $gt: 20 }, sale: true }).exec().then(function (results) {
                expect(results.length).toBe(2);
                done();
            });
        });

        it('Perform the $and operation on a single field', function (done) {
            Model.update({ $and: [
                { price: { $ne: 1.99 } },
                { price: { $gt: 0 } }
            ] }, { $set: { qty: 15 } }).exec().then(function (result) {
                    expect(result).toBe(1);
                    done();
                });
        });

        it('Perform the $and operation on a single field combined', function (done) {
            Model.update({ price: { $ne: 1.99, $gt: 0 } }, { $set: { qty: 15 } }).exec().then(function (result) {
                expect(result).toBe(1);
                done();
            });
        });

        describe('Mongoose', function () {

            it('Find values with Mongoose and operation', function (done) {
                Model.find().and([
                        { price: 1.99 },
                        { qty: { $gt: 20 } },
                        { sale: true }
                    ]).exec().then(function (results) {
                        expect(results.length).toBe(2);
                        done();
                    });
            });
        });
    });

    describe('$and Tests Bugs', function () {

        describe('#41 Unexpected behavior such as null err and result with findOneAndUpdate `$and` queries', function () {
            var AccountModel = require('../../models/AccountModel')(mongoose);
            beforeEach(function(done){
                AccountModel.create(
                    {email: 'valid@valid.com', password: 'password', href:'href'},
                    {email: 'invalid@invalid.com', password: 'password', href:'href'},
                    done);
            });

            it('Should find by both email and password', function (done) {
                AccountModel.find({$and:[{email: 'valid@valid.com'}, {href: 'href'}]}).exec().then(function(results){
                    expect(results.length).toBe(1);
                    var result = results[0];
                    if(result){
                        expect(results[0].email).toBe('valid@valid.com');
                        expect(results[0].href).toBe('href');
                    }
                    done();
                });
            });

            it('Should find by both email and password implicit', function (done) {
                AccountModel.find({email: 'valid@valid.com', href: 'href'}).exec().then(function(results){
                    expect(results.length).toBe(1);
                    var result = results[0];
                    if(result){
                        expect(results[0].email).toBe('valid@valid.com');
                        expect(results[0].href).toBe('href');
                    }
                    done();
                });
            });
        });
    });
});
