/*jshint expr: true*/
/*jshint -W079 */ //redefined expect
var expect = require('chai').expect;

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
            expect(err).not.to.be.ok;
            expect(foo).not.to.be.undefined;
            expect(baz).not.to.be.undefined;
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
                    expect(count).to.equal(1);
                    done();
                },
                function(err) {
                    done(err);
                }
            );
        });

        it('Find should support $ne', function (done) {
            Test.find({value: {$ne: 'baz'}}).exec().then(
                function (results) {
                    expect(results).not.to.be.undefined;
                    expect(results.length).to.equal(1);
                    if(results.length === 1){
                        expect(results[0].value).to.equal('foo');
                    }
                    done();
                },
                function(err) {
                    done(err);
                }
            );
        });
    });
});
