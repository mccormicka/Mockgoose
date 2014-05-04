/*jshint -W106 *///Camel_Case
describe('Index Tests', function () {
    'use strict';

    var mockgoose = require('../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
//    mockgoose(mongoose);
    var db = mongoose.connect('mongodb://localhost:27017/TestingDB');

    var collection;
    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('Setup Indexes', function () {
        var indexSchema = {
            expire: {
                type: Date,
                expires: 1000,
                'default': Date.now
            }
        };
        var IndexModel = db.model('indexmodel', indexSchema);

        beforeEach(function (done) {
            IndexModel.create({}, function (err, model) {
                expect(err).toBeFalsy();
                expect(model).toBeTruthy();
                collection = model.collection;
                done();
            });
        });

        it('Be able to retrieve indexes from a model', function (done) {
            collection.getIndexes(function (err, indexes) {
                expect(indexes).toEqual({ _id_: [
                    [ '_id', 1 ]
                ], expire_1: [
                    [ 'expire', 1 ]
                ] });
                done();
            });
        });
    });

    describe('Bugs', function () {

        // create a model to work on
        mongoose.model('indexUniqueModel', new mongoose.Schema({
            name: { type: String, index: { unique: true } }
        }));
        var IndexUniqueModel = mongoose.model('indexUniqueModel'),
            NAME = 'Vlad Impaler';

        ddescribe('#58 https://github.com/mccormicka/Mockgoose/issues/58', function () {
            it('Support duplicate validation on `index: { unique: true} }`', function (done) {
                expect(function () {
                    IndexUniqueModel.create({ name: NAME });
                }).not.toThrow();
                expect(function () {
                    IndexUniqueModel.create({ name: NAME });
                }).toThrow();
                IndexUniqueModel.create({ name: NAME }, function (err) {
                    expect(err).not.toBe(null);
                    if ( err ) {
                        expect(err.code).toBe(11000);
                    }
                    done();
                });
            });

        });
    });
});
