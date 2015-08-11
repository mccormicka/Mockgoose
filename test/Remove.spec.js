/*jshint expr: true*/
/*jshint -W079 */ //redefined expect
var expect = require('chai').expect;

describe('Mockgoose Remove Tests', function () {
    'use strict';

    var mockgoose = require('..');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB');
    var AccountModel = require('./models/AccountModel')(mongoose);
    var SimpleModel = require('./models/SimpleModel')(mongoose);

    beforeEach(function (done) {
        mockgoose.reset();
        AccountModel.create(
            {email: 'valid@valid.com', password: 'password'},
            {email: 'invalid@invalid.com', password: 'password'},
            function (err, models) {
                expect(err).not.to.be.ok;
                expect(models).to.be.ok;
                SimpleModel.create(
                    {name: 'one', value: 'one'},
                    {name: 'one', value: 'two'},
                    {name: 'one', value: 'two'},
                    {name: 'two', value: 'one'},
                    {name: 'two', value: 'two'},
                    function (err, models) {
                        expect(err).not.to.be.ok;
                        expect(models).to.be.ok;
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

    describe('Remove', function () {
        it('should be able to remove a model', function (done) {
            SimpleModel.remove({name: 'one'}, function (err) {
                expect(err).not.to.be.ok;
                SimpleModel.findOne({name: 'one'}, function (err, model) {
                    expect(err).not.to.be.ok;
                    expect(model).not.to.be.ok;
                    done(err);
                });
            });
        });

        it('Should have an error when mongoose is disconnected', function (done) {
            mockgoose.setMockReadyState(mongoose.connection, 0);

            SimpleModel.remove({name: 'one'}, function (err) {
                expect(err).not.to.be.undefined;
                mockgoose.setMockReadyState(mongoose.connection, 1);
                done();
            });
        });

        it('should be able to remove a model from a model object', function (done) {
            SimpleModel.find({name: 'one'}, function (err, result) {
                expect(err).not.to.be.ok;
                expect(result.length).to.equal(3);
                result[0].remove(function (err) {
                    expect(err).not.to.be.ok;
                    SimpleModel.find({name: 'one'}, function (err, models) {
                        expect(err).not.to.be.ok;
                        expect(models.length).to.equal(2);
                        done(err);
                    });
                });
            });
        });

        it('should be able to remove multiple model', function (done) {
            AccountModel.remove({email: 'valid@valid.com'}, function (err) {
                expect(err).not.to.be.ok;
                AccountModel.findOne({email: 'valid@valid.com'}, function (err, model) {
                    expect(err).not.to.be.ok;
                    expect(model).not.to.be.ok;
                    done(err);
                });
            });
        });
    });

    describe('Bugs', function () {
        describe(' #43 Save doesn\'t work when removing or updating an item in nested array', function () {
            var Schema = new mongoose.Schema({
                name: String,
                friends:[{
                    name:String,
                    books: [
                        {
                            name: String,
                            pages: Number
                        }
                    ]
                }]
            });

            var BugModel = mongoose.model('Bug43', Schema);

            beforeEach(function(done){
                mockgoose.reset();
                BugModel.create({
                    name: 'MyName',
                    friends: [{
                        name: 'MyFriend',
                        books: [{
                            name: 'Book1',
                            pages: 145
                        },{
                            name: 'Book2',
                            pages: 300
                        }]
                    }]
                }, done);
            });

            it('Be able to remove nested item', function (done) {
                BugModel.find({name:'MyName'}).exec().then(function(results){
                    results[0].friends[0].books.pop();
                    results[0].friends[0].books[0].name = 'Book 2 - updated';
                    results[0].save(function(err){
                        expect(err).to.equal(null);
                        BugModel.findOne({name:'MyName'}).exec().then(function(result){
                            expect(result.friends[0].books.length).to.equal(1);
                            expect(result.friends[0].books[0].name).to.equal('Book 2 - updated');
                            done();
                        });
                    });
                });
            });
        });
    });
});
