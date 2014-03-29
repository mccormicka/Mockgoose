describe('Mockgoose Remove Tests', function () {
    'use strict';

    var mockgoose = require('../Mockgoose');
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
                expect(err).toBeFalsy();
                expect(models).toBeTruthy();
                SimpleModel.create(
                    {name: 'one', value: 'one'},
                    {name: 'one', value: 'two'},
                    {name: 'one', value: 'two'},
                    {name: 'two', value: 'one'},
                    {name: 'two', value: 'two'},
                    function (err, models) {
                        expect(err).toBeFalsy();
                        expect(models).toBeTruthy();
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
                expect(err).toBeFalsy();
                SimpleModel.findOne({name: 'one'}, function (err, model) {
                    expect(err).toBeFalsy();
                    expect(model).toBeFalsy();
                    done(err);
                });
            });
        });

        it('should be able to remove a model from a model object', function (done) {
            SimpleModel.find({name: 'one'}, function (err, result) {
                expect(err).toBeFalsy();
                expect(result.length).toBe(3);
                result[0].remove(function (err) {
                    expect(err).toBeFalsy();
                    SimpleModel.find({name: 'one'}, function (err, models) {
                        expect(err).toBeFalsy();
                        expect(models.length).toBe(2);
                        done(err);
                    });
                });
            });
        });

        it('should be able to remove multiple model', function (done) {
            AccountModel.remove({email: 'valid@valid.com'}, function (err) {
                expect(err).toBeFalsy();
                AccountModel.findOne({email: 'valid@valid.com'}, function (err, model) {
                    expect(err).toBeFalsy();
                    expect(model).toBeFalsy();
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
                        expect(err).toBe(null);
                        BugModel.findOne({name:'MyName'}).exec().then(function(result){
                            expect(result.friends[0].books.length).toBe(1);
                            expect(result.friends[0].books[0].name).toBe('Book 2 - updated');
                            done();
                        });
                    });
                });
            });
        });
    });
});