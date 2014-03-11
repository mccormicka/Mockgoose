describe('Mockgoose $ne Tests', function () {
    'use strict';

    var mockgoose = require('./../../../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB');

    var schema = new mongoose.Schema({
        value: String
    });
    var Test = mongoose.model('Test', schema);

    beforeEach(function (done) {
        mockgoose.reset();
        Test.create({value: 'foo'}, {value: 'baz'}, function (err, foo, baz) {
            expect(err).toBeNull();
            expect(foo).toBeDefined();
            expect(baz).toBeDefined();
            done();
        });
    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('$ne', function () {

        it('Count should support $ne', function (done) {
            Test.count({value: {$ne: 'baz'}}).exec().then(
                function (count) {
                    expect(count).toBe(1);
                    done();
                },
                done
            );
        });

        it('Find should support $ne', function (done) {
            Test.find({value: {$ne: 'baz'}}).exec().then(
                function (results) {
                    expect(results).toBeDefined();
                    expect(results.length).toBe(1);
                    if(results.length === 1){
                        expect(results[0].value).toBe('foo');
                    }
                    done();
                },
                done
            );
        });
    });
});