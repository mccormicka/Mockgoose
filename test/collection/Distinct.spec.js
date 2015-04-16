/*jshint expr: true*/
/*jshint -W079 */ //redefined expect
var expect = require('chai').expect;

describe('Mockgoose $distinct Tests', function () {
    'use strict';

    var mockgoose = require('./../../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB2');

    var Schema = new mongoose.Schema({
        dist: String,
        item: {
            sku: String
        },
        price: Number,
        sizes: [String]
    });
    var Model = mongoose.model('distinct', Schema);

    beforeEach(function (done) {
        mockgoose.reset();
        Model.create(
            {dist: 'a', item: {sku: 'sku_a'}, price: 0,  sizes:[]},
            {dist: 'b', item: {sku: 'sku_b'}, price: 11, sizes:['s','m']},
            {dist: 'c', item: {sku: 'sku_c'}, price: 12, sizes:['m']},
            {dist: 'c', item: {sku: 'sku_c'}, price: 12, sizes:['s','m','l']},
            function (err) {
                done(err);
            }
        );
    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('$distinct', function () {
        it('Return distinct items', function (done) {
            Model.distinct('dist').exec().then(function (values) {
                values.sort();
                expect(values.length).to.equal(3);
                expect(values[0]).to.equal('a');
                expect(values[1]).to.equal('b');
                expect(values[2]).to.equal('c');
                done();
            });
        });

        it('Should have error when mongoose is disconnected', function (done) {
            mockgoose.setMockReadyState(mongoose.connection, 0);

            Model.distinct('dist', function (err, values) {
                expect(err).not.to.be.undefined;
                expect(values).to.be.undefined;
                mockgoose.setMockReadyState(mongoose.connection, 1);
                done();
            });
        });

        it('Return distinct nested items', function (done) {
            Model.distinct('item.sku').exec().then(function (values) {
                values.sort();
                expect(values.length).to.equal(3);
                expect(values[0]).to.equal('sku_a');
                expect(values[1]).to.equal('sku_b');
                expect(values[2]).to.equal('sku_c');
                done();
            });
        });

        it('Return distinct items with subclause', function (done) {
            Model.distinct('price', { price: { $gt: 10 }}).exec().then(function (values) {
                values.sort();
                expect(values.length).to.equal(2);
                expect(values[0]).to.equal(11);
                expect(values[1]).to.equal(12);
                done();
            });
        });

        it('Return distinct items with arrays', function (done) {
            Model.distinct('sizes').exec().then(function (values) {
                values.sort();
                expect(values.length).to.equal(3);
                expect(values[0]).to.equal('l');
                expect(values[1]).to.equal('m');
                expect(values[2]).to.equal('s');
                done();
            });
        });

    });
});
