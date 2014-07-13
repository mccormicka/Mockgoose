describe('Mockgoose $INC Operation Tests', function () {
    'use strict';

    var mockgoose = require('../../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.createConnection('mongodb://localhost/TestingDB');
    var IndexModel = require('./../models/IndexModel')(mongoose);

    beforeEach(function (done) {
        mockgoose.reset();
        IndexModel.create(
            {name: 'one', value: 3},
            function (err, models) {
                expect(err).toBeFalsy();
                expect(models).toBeTruthy();
                done(err);
            }
        );
    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('$inc', function () {

        it('Be able to increment a value', function (done) {
            IndexModel.findOneAndUpdate({name: 'one'}, {$inc: {value: 5}}, function (err, res) {
                expect(res.value).toBe(8);
                done(err);
            });
        });

        it('Be able to decrement a value', function (done) {
            IndexModel.findOneAndUpdate({name: 'one'}, {$inc: {value: -5}}, function (err, res) {
                expect(res.value).toBe(-2);
                done(err);
            });
        });

        it('Be able to update multiple values', function (done) {
            IndexModel.findOneAndUpdate({name: 'one'}, {$inc: {value: -5, increment: 5}}, function (err, res) {
                expect(res.value).toBe(-2);
                expect(res.increment).toBe(10);
                done(err);
            });
        });
    });

    ddescribe('Bugs', function () {
        var Schema = new mongoose.Schema({
            name:String
        });
        var Model = mongoose.model('Bugs', Schema);

        it('#52 https://github.com/mccormicka/Mockgoose/issues/52', function (done) {
            Model.create({name:'bug_52'}).then(function(){
                Model.findOneAndUpdate({name:'bug_52'}, {$inc: {counter: 1}}).exec().then(function(result){
                    expect(result.counter).toBe(1);
                    done();
                });
            });
        });

    });
});