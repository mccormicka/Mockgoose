'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var async = require('async');

var mongooseLib = require('mongoose');
var Connection = mongooseLib.Connection;
var ConnectionPrototype = Connection.prototype;
var Mongoose = mongooseLib.Mongoose;
var mockgoose = require('../Mockgoose');

var sandbox = sinon.sandbox.create();
var mongoose;

var CONNECTION_BASE = { options: {} };

// localhost:27017 is likely to conflict with `process.env.MOCKGOOSE_LIVE`
//   which makes for an excellent Test Scenario
var HOST = 'localhost';
var PORT = 27017;
var DB = 'DB';
var DB2 = 'DB2';
var USER_HOST_DB_PORT = [ HOST, DB, PORT ];
var USER_HOST_DB2_PORT = [ HOST, DB2, PORT ];

// assumed by Mockgoose, with adaptive port
var MONGOD_HOST = '127.0.0.1';
var MONGOD_HOST_DB = [ MONGOD_HOST, DB ];
var MONGOD_HOST_DB2 = [ MONGOD_HOST, DB2 ];

// FIXME: patiently wait for mongod to shut down
var FIXME_INTER_TEST_DELAY = 1000;


describe('mongoose.Connection', function() {
    beforeEach(function() {
        mongoose = new Mongoose();
    });

    afterEach(function(done) {
        // safety in the face of assertion failure
        mongoose.unmock(function() {
            // AFTER we've put back any spys & stubs
            sandbox.restore();

            setTimeout(done, FIXME_INTER_TEST_DELAY);
        });
    });


    describe('#open', function() {
        var connections;
        var openSpy, _openStub;
        var _openState;

        beforeEach(function() {
            connections = [];
            _openState = [];

            // #open (eg. to the mock DB) as usual
            openSpy = sandbox.spy(ConnectionPrototype, 'open');

            var _openOriginal = ConnectionPrototype._open;
            _openStub = sandbox.stub(ConnectionPrototype, '_open', function() {
                // the host & port get faked out
                _openState.push([
                    this.host, this.name, this.port,
                ]);

                // other than that, #_open as usual
                _openOriginal.apply(this, arguments);
            });

            // AFTER we apply the spys & stubs
            mockgoose(mongoose);
        });


        describe('followed by #unmock', function() {
            it('fakes out a single call', function(done) {
                async.series([
                    function(next) {
                        connections.push(new Connection(CONNECTION_BASE));
                        connections[0].open(HOST, DB, PORT, next);
                    },
                    function(next) {
                        mongoose.unmock(next);
                    },
                    function(next) {
                        expect(openSpy.callCount).to.equal(1);
                        // connect
                        expect(openSpy.args[0].slice(0, 3)).to.deep.equal(USER_HOST_DB_PORT);

                        expect(openSpy.callCount).to.equal(1);

                        // connect (+ mock)
                        //   at which point we are connected to the host + database
                        //   yet we can't be sure what port we're connected to
                        expect(_openState[0].slice(0, 2)).to.deep.equal(MONGOD_HOST_DB);

                        next();
                    },
                ], done);
            });

            it('fakes out more than one call', function(done) {
                async.series([
                    function(next) {
                        connections.push(new Connection(CONNECTION_BASE));
                        connections[0].open(HOST, DB, PORT, next);
                    },
                    function(next) {
                        connections.push(new Connection(CONNECTION_BASE));
                        connections[1].open(HOST, DB2, PORT, next);
                    },
                    function(next) {
                        mongoose.unmock(next);
                    },
                    function(next) {
                        expect(openSpy.callCount).to.equal(2);
                        // connect
                        expect(openSpy.args[0].slice(0, 3)).to.deep.equal(USER_HOST_DB_PORT);
                        expect(openSpy.args[1].slice(0, 3)).to.deep.equal(USER_HOST_DB2_PORT);

                        expect(openSpy.callCount).to.equal(2);
                        // connect (+ mock)
                        //   at which point we are connected to the host + database
                        //   yet we can't be sure what port we're connected to
                        expect(_openState[0].slice(0, 2)).to.deep.equal(MONGOD_HOST_DB);
                        expect(_openState[1].slice(0, 2)).to.deep.equal(MONGOD_HOST_DB2);
                        //   but it's the same port for both
                        expect(_openState[0][2]).to.equal(_openState[1][2]);

                        next();
                    },
                ], done);
            });
        });


        describe('with a reconnect', function() {
            if (! process.env.MOCKGOOSE_LIVE) {
                return;
            }


            it('reconnects a single call', function(done) {
                async.series([
                    function(next) {
                        connections.push(new Connection(CONNECTION_BASE));
                        connections[0].open(HOST, DB, PORT, next);
                    },
                    function(next) {
                        mongoose.unmockAndReconnect(next);
                    },
                    function(next) {
                        expect(openSpy.callCount).to.equal(2);
                        // connect
                        expect(openSpy.args[0].slice(0, 3)).to.deep.equal(USER_HOST_DB_PORT);
                        // reconnect
                        expect(openSpy.args[1].slice(0, 3)).to.deep.equal(USER_HOST_DB_PORT);

                        expect(openSpy.callCount).to.equal(2);

                        // connect (+ mock)
                        //   at which point we are connected to the host + database
                        //   yet we can't be sure what port we're connected to
                        expect(_openState[0].slice(0, 2)).to.deep.equal(MONGOD_HOST_DB);
                        // reconnect
                        expect(_openState[1]).to.deep.equal(USER_HOST_DB_PORT);

                        next();
                    },
                ], done);
            });

            it('reconnects more than one call', function(done) {
                async.series([
                    function(next) {
                        connections.push(new Connection(CONNECTION_BASE));
                        connections[0].open(HOST, DB, PORT, next);
                    },
                    function(next) {
                        connections.push(new Connection(CONNECTION_BASE));
                        connections[1].open(HOST, DB2, PORT, next);
                    },
                    function(next) {
                        mongoose.unmockAndReconnect(next);
                    },
                    function(next) {
                        expect(openSpy.callCount).to.equal(4);
                        // connect
                        expect(openSpy.args[0].slice(0, 3)).to.deep.equal(USER_HOST_DB_PORT);
                        expect(openSpy.args[1].slice(0, 3)).to.deep.equal(USER_HOST_DB2_PORT);
                        // reconnect
                        expect(openSpy.args[2].slice(0, 3)).to.deep.equal(USER_HOST_DB_PORT);
                        expect(openSpy.args[3].slice(0, 3)).to.deep.equal(USER_HOST_DB2_PORT);

                        expect(openSpy.callCount).to.equal(4);

                        // connect (+ mock)
                        //   at which point we are connected to the host + database
                        //   yet we can't be sure what port we're connected to
                        expect(_openState[0].slice(0, 2)).to.deep.equal(MONGOD_HOST_DB);
                        expect(_openState[1].slice(0, 2)).to.deep.equal(MONGOD_HOST_DB2);
                        //   but it's the same port for both
                        expect(_openState[0][2]).to.equal(_openState[1][2]);
                        // reconnect
                        expect(_openState[2]).to.deep.equal(USER_HOST_DB_PORT);
                        expect(_openState[3]).to.deep.equal(USER_HOST_DB2_PORT);

                        next();
                    },
                ], done);
            });
        });
    });
});
