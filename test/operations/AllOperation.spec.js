/*jshint expr: true*/
/*jshint -W079 */ //redefined expect
var expect = require('chai').expect;

describe('Mockgoose $all Tests', function () {
    'use strict';

    var mockgoose = require('../..');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB');

    var Schema = new mongoose.Schema({
        code: String,
        tags: [
            {type: String}
        ],
        qty: [
            {
                size: String,
                num: Number,
                color: String
            }
        ],
        myRefs: [
            {type: mongoose.Schema.Types.ObjectId}
        ]
    });
    var Model = mongoose.model('AllTests', Schema);
    var myIds = [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()];

    beforeEach(function (done) {
        mockgoose.reset();
        Model.create({
                code: 'xyz',
                tags: [ 'school', 'book', 'bag', 'headphone', 'appliance' ],
                qty: [
                    { size: 'S', num: 10, color: 'blue' },
                    { size: 'M', num: 45, color: 'blue' },
                    { size: 'L', num: 100, color: 'green' }
                ]
            },
            {
                code: 'abc',
                tags: [ 'appliance', 'school', 'book' ],
                qty: [
                    { size: '6', num: 100, color: 'green' },
                    { size: '6', num: 50, color: 'blue' },
                    { size: '8', num: 100, color: 'brown' }
                ]
            },
            {
                code: 'efg',
                tags: [ 'school', 'book' ],
                qty: [
                    { size: 'S', num: 10, color: 'blue' },
                    { size: 'M', num: 100, color: 'blue' },
                    { size: 'L', num: 100, color: 'green' }
                ]
            },
            {
                code: 'ijk',
                tags: [ 'electronics', 'school' ],
                qty: [
                    { size: 'M', num: 100, color: 'green' }
                ]
            },
            {
                code: 'lmn',
                myRefs: myIds
            }, done);
    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('$all Tests', function () {

        it('Be able to match values', function (done) {
            Model.find({ tags: { $all: [ 'appliance', 'school', 'book' ] } }).exec().then(function (results) {
                expect(results).not.to.be.undefined;
                expect(results.length).to.equal(2);
                if (results.length === 2) {
                    expect(results[0].code).to.equal('xyz');
                    expect(results[1].code).to.equal('abc');
                    done();
                } else {
                    done('Error retreiving all data');
                }
            }, done);
        });

        it('$elemMatch items', function (done) {
            Model.find({
                qty: { $all: [
                    { '$elemMatch': { size: 'M', num: { $gt: 50 } } },
                    { '$elemMatch': { num: 100, color: 'green' } }
                ] }
            }).exec().then(function (results) {
                    expect(results).not.to.be.undefined;
                    expect(results.length).to.equal(2);
                    if (results.length === 2) {
                        expect(results[0].code).to.equal('efg');
                        expect(results[1].code).to.equal('ijk');
                        done();
                    } else {
                        done('Error retreiving all data');
                    }
                }, done);
        });

        it('Be able to match ObjectIds', function(done) {
            Model.find({myRefs: {$all: myIds}}).exec().then(function(results) {
                expect(results).not.to.be.undefined;
                expect(results.length).to.equal(1);
                if (results.length === 1) {
                    expect(results[0].code).to.equal('lmn');
                    done();
                } else {
                    done('Error retreiving all data');
                }
            }, done);
        });
    });
});
