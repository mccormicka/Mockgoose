describe('Mockgoose $or Tests', function () {
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
        historyprice: [Number],
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
                sale: true,
                historyprice: [1.90, 1.77, 1.50]
            },
            {
                price: 1.99,
                qty: 50,
                sale: true,
                historyprice: [1.85, 1.60, 1.40]
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
                sale: false,
                historyprice: [0.99]
            }, {
                price: 10,
                qty: 21,
                sale: false,
                historyprice: [8.99, 7.99]
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

    describe('$or Tests', function () {

        it('Find values that are less than 20 and on sale', function (done) {
            Model.find({ price: 1.99, $or: [
                { qty: { $lt: 20 } },
                { sale: true }
            ] }).exec().then(function (results) {
                    expect(results.length).toBe(3);
                    done();
                });
        });

        it('Find values that are greater than 20 or on sale', function (done) {
            Model.find({ price: 1.99, $or: [
                { qty: { $gt: 40 } },
                { sale: false }
            ] }).exec().then(function (results) {
                    expect(results.length).toBe(2);
                    done();
                });
        });

        it('Update embed $or statement', function (done) {
            Model.update({ $or: [
                { price: 10.99 },
                { 'carrier.state': 'NY'}
            ] }, { $set: { sale: true } }).exec().then(function () {
                    Model.findOne({'carrier.state': 'NY'}).exec().then(function(result){
                        expect(result.sale).toBe(true);
                        done();
                    });
                });
        });
        it('$or with $in operation', function (done) {
            Model.find({ $or: [
                { price: 1.99 },
                { sale: true }
            ], qty: { $in: [20, 50] } }).exec().then(function (results) {
                expect(results.length).toBe(2);
                done();
            });
        });

        it('$or in an array of values', function (done) {
            Model.find({ $or: [ 
                { historyprice: 8.99 },
                { price: 1.99 }
            ]}).exec().then(function(results) {
                expect(results.length).toBe(5);
                done();
            });
        });
    });
});