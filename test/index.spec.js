/*jshint expr: true*/
/*jshint -W106 *///Camel_Case
/*jshint -W079 */ //redefined expect
var expect = require('chai').expect;

describe('Index Tests', function () {
    'use strict';

    var mockgoose = require('..');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    var db = mongoose.connect('mongodb://localhost:27017/TestingDB');

    var collection;
    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('SHOULD', function () {

        describe('Setup Indexes', function () {
            var indexSchema = {
                expire: {
                    type: Date,
                    expires: 1000,
                    'default': Date.now
                }
            };
            var IndexModel = db.model('indexmodel', indexSchema);

            beforeEach(function(done){
                IndexModel.create({}, function(err, model){
                    expect(err).not.to.be.ok;
                    expect(model).to.be.ok;
                    collection = model.collection;
                    done();
                });
            });

            it('Be able to retrieve indexes from a model', function (done) {
                collection.getIndexes(function(err, indexes){
                    expect(indexes).to.deep.equal({ _id_ : [ [ '_id', 1 ] ], expire_1 : [ [ 'expire', 1 ] ] });
                    // expect(indexes).to.deep.equal({ _id_ : [ [ '_id', 1 ] ] }); wtf?
                    done();
                });
            });
        });

    });
});
