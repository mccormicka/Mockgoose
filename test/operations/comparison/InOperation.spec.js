describe('Mockgoose Find Tests', function () {
    'use strict';

    var mockgoose = require('./../../../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB-1');
    var AccountModel = require('./../../models/AccountModel')(mongoose);
    var SimpleModel = require('./../../models/SimpleModel')(mongoose);

    var accountId;
    beforeEach(function (done) {
        mockgoose.reset();
        AccountModel.create(
            {email: 'valid@valid.com', password: 'password'},
            {email: 'invalid@invalid.com', password: 'password'},
            function (err, valid, invalid) {
                expect(err).toBeFalsy();
                expect(valid).toBeTruthy();
                accountId = valid._id;
                expect(invalid).toBeTruthy();
                SimpleModel.create(
                    {name: 'one', value: 'one'},
                    {name: 'one', value: 'two'},
                    {name: 'one', value: 'two'},
                    {name: 'two', value: 'one'},
                    {name: 'two', value: 'two'},
                    function (err, one, two, three) {
                        expect(err).toBeFalsy();
                        expect(one).toBeTruthy();
                        expect(two).toBeTruthy();
                        expect(three).toBeTruthy();
                        done(err);
                    }
                );
            });

    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('$in', function () {

        it('should be able to find a model $in', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: ['one', 'two']},
                {email: 'multiples@invalid.com', password: 'password', values: ['two', 'three']},
                function () {
                    AccountModel.findOne({values: {$in: ['three']}}, function (err, result) {
                        expect(result).toBeDefined();
                        if (result) {
                            expect(result.values[1]).toBe('three');
                            done(err);
                        } else {
                            done('Error finding model');
                        }
                    });
                });
        });

        it('should be able to find models $in with more than one value', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: ['one', 'two']},
                {email: 'multiples@invalid.com', password: 'password', values: ['two', 'three']},
                function () {
                    AccountModel.find({values: {$in: ['two']}}, function (err, result) {
                        expect(result).toBeDefined();
                        if (result) {
                            expect(result.length).toBe(2);
                            done(err);
                        } else {
                            done('Error finding models');
                        }
                    });
                });
        });

        it('should be able to find models $in with multiple values', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: ['one', 'two']},
                {email: 'multiples@invalid.com', password: 'password', values: ['two', 'three']},
                function () {
                    AccountModel.find({values: {$in: ['two', 'three']}}, function (err, result) {
                        expect(result).toBeDefined();
                        if (result) {
                            expect(result.length).toBe(2);
                            done(err);
                        } else {
                            done('Error finding models');
                        }
                    });
                });
        });

        it('should not perform partial match', function(done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: ['one', 'two']},
                {email: 'multiples@invalid.com', password: 'password', values: ['two', 'three']},
                function () {
                    AccountModel.find({email: {$in: ['valid']}}, function (err, result) {
                        expect(err).toBeFalsy();
                        expect(result).toBeDefined();
                        if (result) {
                            expect(result.length).toBe(0);
                            done(err);
                        } else {
                            done('Incorrectly matched models');
                        }
                    });
                });
        });
    });

    describe('Nested Values', function () {
        var schema = new mongoose.Schema({
            value: String,
            nested: {
                value: String
            }
        });

        var Test = mongoose.model('Test', schema);

        it('work with nested values', function (done) {
            Test.create({ 'value': 'Test', 'nested.value': 'Test' }, function (er, test) {
                Test.findOne({ 'nested.value': { $in : ['Test'] } } , function (er, result) {
                    expect(er).toBeNull();
                    expect(result._id.toString()).toBe(test._id.toString());
                    done();
                });
            });
        });
    });

    describe('ObjectIds', function() {
        var schema = new mongoose.Schema({
            myRefs: [
                {type: mongoose.Schema.Types.ObjectId}
            ]
        });
        var Test = mongoose.model('InObjectIdTest', schema);
        var myIds = [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()];

        it('works with ObjectIds', function(done) {
           Test.create({myRefs: myIds}, function(er, test) {
               Test.findOne({ myRefs: { $in: [myIds[0]] } }, function(er, result) {
                   expect(er).toBeNull();
                   expect(result._id.toString()).toBe(test._id.toString());
                   done();
               });
           });
        });

    });
});
