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
                expect(values.length).toBe(3);
                expect(values[0]).toBe('a');
                expect(values[1]).toBe('b');
                expect(values[2]).toBe('c');
                done();
            });
        });

        it('Should have error when mongoose is disconnected', function (done) {
            mockgoose.setMockReadyState(mongoose.connection, 0);

            Model.distinct('dist', function (err, values) {
                expect(err).toBeDefined();
                expect(values).toBeUndefined();
                mockgoose.setMockReadyState(mongoose.connection, 1);
                done();
            });
        });

        it('Return distinct nested items', function (done) {
            Model.distinct('item.sku').exec().then(function (values) {
                values.sort();
                expect(values.length).toBe(3);
                expect(values[0]).toBe('sku_a');
                expect(values[1]).toBe('sku_b');
                expect(values[2]).toBe('sku_c');
                done();
            });
        });

        it('Return distinct items with subclause', function (done) {
            Model.distinct('price', { price: { $gt: 10 }}).exec().then(function (values) {
                values.sort();
                expect(values.length).toBe(2);
                expect(values[0]).toBe(11);
                expect(values[1]).toBe(12);
                done();
            });
        });

        it('Return distinct items with arrays', function (done) {
            Model.distinct('sizes').exec().then(function (values) {
                values.sort();
                expect(values.length).toBe(3);
                expect(values[0]).toBe('l');
                expect(values[1]).toBe('m');
                expect(values[2]).toBe('s');
                done();
            });
        });

    });
});
