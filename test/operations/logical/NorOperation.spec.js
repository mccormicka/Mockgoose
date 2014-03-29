describe('Mockgoose $nor Tests', function () {
    'use strict';

    var mockgoose = require('./../../../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB');

    var Schema = new mongoose.Schema({
        price: Number,
        qty: Number,
        sale: Boolean,
        carrier: {
            state: String
        }
    });
    var Model = mongoose.model('OrTests', Schema);

    beforeEach(function (done) {
        mockgoose.reset();
        Model.create(
            {
                price: 1.99,
                qty: 20,
                sale: true
            },
            {
                price: 1.99,
                qty: 50,
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
            }, {
                price: 10,
                qty: 4,
                sale: false
            },
            {
                sale: false
            },
            {
                price: 2.99
            },
            done
        );
    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('$nor', function () {
        it('Find values that are not 1.99 and are not on sale', function (done) {
            Model.find({ $nor: [
                { price: 1.99 },
                { sale: true }
            ]  }).exec().then(function (results) {
                expect(results.length).toBe(4);
                done();
            });
        });
        it('Find values that are not 1.99 and are not on sale and qty is not less than 20', function (done) {
            Model.find({ $nor: [
                { price: 1.99 },
                { qty: { $lt: 20 } },
                { sale: true }
            ] }).exec().then(function (results) {
                expect(results.length).toBe(3);
                done();
            });
        });

        it('$nor with $exists', function (done) {
            Model.find({ $nor: [
                { price: 1.99 },
                { price: { $exists: false } },
                { sale: true },
                { sale: { $exists: false } }
            ] }).exec().then(function (results) {
                    expect(results.length).toBe(2);
                    done();
                });
        });
    });
});
