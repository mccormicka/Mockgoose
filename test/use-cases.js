'use strict';

var expect = require('chai').expect;
var async = require('async');

var Mongoose = require('mongoose').Mongoose;
var mockgoose = require('../Mockgoose');

var mongoose;
var Cat;

var HOST = '127.0.0.1'; // because `process.env.MOCKGOOSE_LIVE`
var DB = 'DB';
var PORT = 27017;
var MOCK_OPTIONS = {
    port: 27027
};


describe('mockgoose', function() {
    beforeEach(function() {
        mongoose = new Mongoose();

        mockgoose(mongoose, MOCK_OPTIONS);
    });

    afterEach(function(done) {
        // safety in the face of assertion failure
        mongoose.unmock(function() {
            // patiently wait for mongod to shut down
            //   or else we can't guarantee `MOCK_OPTIONS.port` across tests
            setTimeout(done, 200);
        });
    });


    describe('reset', function() {
        describe('after Mongoose#connect', function() {
            it('resets a Collection', function(done) {
                var cat;

                async.waterfall([
                    function(next) {
                        mongoose.connect(HOST, DB, PORT, next);
                    },
                    function(next) {
                        Cat = mongoose.model('Cat', { name: String });

                        Cat.create({ name: 'Disco' }, next);
                    },
                    function(_cat, next) {
                        cat = _cat;

                        Cat.findById(cat._id, next);
                    },
                    function(_cat, next) {
                        expect(_cat.name).to.equal('Disco'); // good girl!

                        mockgoose.reset(next);
                    },
                    function(next) {
                        Cat.findById(cat._id, next);
                    },
                    function(_cat, next) {
                        // kitty was reset
                        expect(_cat).to.equal(null);

                        next();
                    },
                ], done);
            });
        });

        describe('after Mongoose#createConnection + Connection#open', function() {
            it('resets a Collection', function(done) {
                var connection;
                var cat;

                async.waterfall([
                    function(next) {
                        connection = mongoose.createConnection();
                        connection.open(HOST, DB, PORT, next);
                    },
                    function(next) {
                        Cat = connection.model('Cat', { name: String });

                        cat = (new Cat({ name: 'Warhol' }));
                        cat.save(next);
                    },
                    function(_cat, status, next) {
                        Cat.findById(cat._id, next);
                    },
                    function(_cat, next) {
                        expect(_cat.name).to.equal('Warhol'); // good boy!

                        mockgoose.reset(next);
                    },
                    function(next) {
                        Cat.findById(cat._id, next);
                    },
                    function(_cat, next) {
                        // kitty was reset
                        expect(_cat).to.equal(null);

                        next();
                    },
                ], done);
            });
        });
    });


    describe('unmock + re-mock', function() {
        describe('after Mongoose#connect', function() {
            it('gets a fresh empty database', function(done) {
                var cat;

                async.waterfall([
                    function(next) {
                        mongoose.connect(HOST, DB, PORT, next);
                    },
                    function(next) {
                        Cat = mongoose.model('Cat', { name: String });

                        Cat.create({ name: 'Disco' }, next);
                    },
                    function(_cat, next) {
                        cat = _cat;

                        Cat.findById(cat._id, next);
                    },
                    function(_cat, next) {
                        expect(_cat.name).to.equal('Disco'); // good girl!

                        mongoose.unmock(next);
                    },
                    function(next) {
                        mockgoose(mongoose, MOCK_OPTIONS);

                        mongoose.connect(HOST, DB, PORT, next);
                    },
                    function(next) {
                        // // "Cannot overwrite `Cat` model once compiled."
                        // Cat = mongoose.model('Cat', { name: String });

                        Cat.findById(cat._id, next);
                    },
                    function(_cat, next) {
                        // kitty was left in the prior mock database
                        expect(_cat).to.equal(null);

                        next();
                    },
                ], done);
            });
        });

        describe('after Mongoose#createConnection + Connection#open', function() {
            it('gets a fresh empty database', function(done) {
                var connection;
                var cat;

                async.waterfall([
                    function(next) {
                        connection = mongoose.createConnection();
                        connection.open(HOST, DB, PORT, next);
                    },
                    function(next) {
                        Cat = connection.model('Cat', { name: String });

                        cat = (new Cat({ name: 'Warhol' }));
                        cat.save(next);
                    },
                    function(_cat, status, next) {
                        Cat.findById(cat._id, next);
                    },
                    function(_cat, next) {
                        expect(_cat.name).to.equal('Warhol'); // good boy!

                        mongoose.unmock(next);
                    },
                    function(next) {
                        mockgoose(mongoose, MOCK_OPTIONS);

                        connection = mongoose.createConnection();
                        connection.open(HOST, DB, PORT, next);
                    },
                    function(next) {
                        Cat = connection.model('Cat', { name: String });

                        Cat.findById(cat._id, next);
                    },
                    function(_cat, next) {
                        // kitty was left in the prior mock database
                        expect(_cat).to.equal(null);

                        next();
                    },
                ], done);
            });
        });
    });


    describe('unmockAndReconnect', function() {
        if (! process.env.MOCKGOOSE_LIVE) {
            return;
        }


        describe('after Mongoose#connect', function() {
            it('finds nothing in the "real" database', function(done) {
                var cat;

                async.waterfall([
                    function(next) {
                        mongoose.connect(HOST, DB, PORT, next);
                    },
                    function(next) {
                        Cat = mongoose.model('Cat', { name: String });

                        Cat.create({ name: 'Disco' }, next);
                    },
                    function(_cat, next) {
                        cat = _cat;

                        Cat.findById(cat._id, next);
                    },
                    function(_cat, next) {
                        expect(_cat.name).to.equal('Disco'); // good girl!

                        mongoose.unmockAndReconnect(next);
                    },
                    function(next) {
                        Cat.findById(cat._id, next);
                    },
                    function(_cat, next) {
                        // kitty was never saved to the "real" database
                        expect(_cat).to.equal(null);

                        next();
                    },
                ], done);
            });
        });

        describe('after Mongoose#createConnection + Connection#open', function() {
            it('finds nothing in the "real" database', function(done) {
                var connection;
                var cat;

                async.waterfall([
                    function(next) {
                        connection = mongoose.createConnection();
                        connection.open(HOST, DB, PORT, next);
                    },
                    function(next) {
                        Cat = connection.model('Cat', { name: String });

                        cat = (new Cat({ name: 'Warhol' }));
                        cat.save(next);
                    },
                    function(_cat, status, next) {
                        Cat.findById(cat._id, next);
                    },
                    function(_cat, next) {
                        expect(_cat.name).to.equal('Warhol'); // good boy!

                        mongoose.unmockAndReconnect(next);
                    },
                    function(next) {
                        Cat.findById(cat._id, next);
                    },
                    function(_cat, next) {
                        // kitty was never saved to the "real" database
                        expect(_cat).to.equal(null);

                        next();
                    },
                ], done);
            });
        });
    });
});
