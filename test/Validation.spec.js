/*jshint expr: true*/
/*jshint -W079 */ //redefined expect
var expect = require('chai').expect;
var async  = require('async');

describe('Mockgoose model validation Tests', function () {
    'use strict';

    var mockgoose = require('..');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB');
    var AccountModel = require('./models/AccountModel')(mongoose);
    var CompoundUniqueIndexModel = require('./models/CompoundUniqueIndexModel')(mongoose);

    beforeEach(function (done) {
        mockgoose.reset();
        async.waterfall([
           function(callback) {
                AccountModel.create(
                    {email: 'valid@valid.com', password: 'password'},
                    function (err, models) {
                        expect(err).not.to.be.ok;
                        expect(models).to.be.ok;
                        callback(err);
                    }
                );
           },
           function(callback) {
                CompoundUniqueIndexModel.create(
                    {owner: 'foo', name: 'bar'},
                    function (err, models) {
                        expect(err).not.to.be.ok;
                        expect(models).to.be.ok;
                        callback(err);
                    }
                );
           }
        ], function(err) {
            done(err);
        });
    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    it('should be able to invoke validator on a test model', function (done) {
        //Email needs to be unique!
        AccountModel.create({email: 'valid@valid.com', password: 'supersecret'}, function (err, model) {
            expect(err).not.to.be.undefined;
            expect(model).not.to.be.ok;
            if(err){
                expect(err.name).to.equal('MongoError');
                expect(err.message).to.equal('E11000 duplicate key error index: email');
            }
            done();
        });
    });

    it('should be able to invoke validator on a compound unique index model', function (done) {
        //Both values need to be unique!
        CompoundUniqueIndexModel.create({owner: 'foo', name: 'bar'}, function (err, model) {
            expect(err).not.to.be.undefined;
            expect(model).not.to.be.ok;
            if(err){
                expect(err.name).to.equal('MongoError');
                expect(err.message).to.equal('E11000 duplicate key error index: owner, name');
            }
            done();
        });
    });

});
