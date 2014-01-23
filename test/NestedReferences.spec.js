describe('Nested Ref Tests', function () {
    'use strict';

    var mockgoose = require('../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost:27017/TestingDB3');
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var schema = new mongoose.Schema({
        values: [String],
        nestedValues: [
            { value: String}
        ],
        refs: [
            { type: ObjectId, ref: 'Ref' }
        ],
        nestedRefs: [
            { _ref: { type: ObjectId, ref: 'Ref' } }
        ]
    });
    var rschema = new mongoose.Schema();

    var Test = mongoose.model('Test', schema);
    var Ref = mongoose.model('Ref', rschema);

    var refA = new Ref();
    var refB = new Ref();

    beforeEach(function (done) {
        mockgoose.reset();
        Test.create({
            values: ['Foo', 'Bar', 'Baz'],
            nestedValues: [
                { value: 'Bob' },
                { value: 'Bill' },
                { value: 'Jim' }
            ],
            refs: [ refA, refB ],
            nestedRefs: [
                { _ref: refA },
                { _ref: refB }
            ]
        }, function (err) {
            done(err);
        });
    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('SHOULD', function () {
        it('Find Value By Ref', function (done) {
            Test.count({ refs: refA }, function (err, count) {
                expect(count).toBe(1);
                done(err);
            });
        });

        it('Find by nested value', function (done) {
            Test.count({ 'nestedValues.value': 'Bob' }, function (err, count) {
                expect(count).toBe(1);
                done(err);
            });
        });

        it('Find by nested value by Ref', function (done) {
            Test.count({ 'nestedRefs._ref': refA  }, function (err, count) {
                expect(count).toBe(1);
                done(err);
            });
        });

    });
});