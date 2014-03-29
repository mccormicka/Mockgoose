describe('Mockgoose $not Tests', function () {
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
    var Model = mongoose.model('NotTests', Schema);

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
                qty: 21,
                sale: false
            }, {
                carrier: {
                    state: 'NY'
                },
                price: 1,
                qty: 21,
                sale: false
            }, {
                carrier: {
                    state: 'LA'
                },
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

    describe('$not Tests', function () {

        it('Find prices that are not greater 1.99 ', function (done) {
            Model.find( { price: { $not: { $gt: 1.99 } } } ).exec().then(function (results) {
                    expect(results.length).toBe(7);
                    done();
                });
        });

        it('$not with regexp', function (done) {
            Model.find( { 'carrier.state': { $not: new RegExp('^L.*') } } ).exec().then(function (results) {
                    expect(results.length).toBe(7);
                    done();
                });
        });

    });
});
