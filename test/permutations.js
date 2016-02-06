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
var HOST = '127.0.0.1'; // because `process.env.MOCKGOOSE_LIVE`
var DB = 'DB';
var DB2 = 'DB2';
var PORT = 27017;
var MOCK_HOST = 'localhost';
var MOCK_OPTIONS = {
    port: 27027
};


describe('mockgoose', function() {
    beforeEach(function() {
        mongoose = new Mongoose();
    });

    afterEach(function(done) {
        // safety in the face of assertion failure
        mongoose.unmock(function() {
            // AFTER we've put back any spys & stubs
            sandbox.restore();

            // patiently wait for mongod to shut down
            //   or else we can't guarantee `MOCK_OPTIONS.port` across tests
            setTimeout(done, 200);
        });
    });


    describe('reset', function() {
        var Collection = mongooseLib.Collection;
        var collections;
        var connection;

        beforeEach(function() {
            mockgoose(mongoose, MOCK_OPTIONS);

            collections = [];
            sandbox.spy(Collection.prototype, 'deleteMany');
        });


        it('works without any Connections', function(done) {
            async.series([
                function(next) {
                    mockgoose.reset(next);
                },
                function(next) {
                    expect(Collection.prototype.deleteMany.called).to.equal(false);

                    next();
                },
            ], done);
        });

        it('works with one Connection', function(done) {
            async.series([
                function(next) {
                    connection = new Connection(CONNECTION_BASE);
                    connection.open(HOST, DB, PORT, next);
                },
                function(next) {
                    collections.push(connection.collection('MOE'));

                    mockgoose.reset(next);
                },
                function(next) {
                    expect(Collection.prototype.deleteMany.callCount).to.equal(1);

                    expect(collections.every(function(collection) {
                        return collection.deleteMany.called;
                    })).to.equal(true);

                    next();
                },
            ], done);
        });

        it('works with more than one Connection', function(done) {
            async.series([
                function(next) {
                    connection = new Connection(CONNECTION_BASE);
                    connection.open(HOST, DB, PORT, next);
                },
                function(next) {
                    collections.push(connection.collection('MOE'));

                    connection = new Connection(CONNECTION_BASE);
                    connection.open(HOST, DB2, PORT, next);
                },
                function(next) {
                    collections.push(connection.collection('JOE'));
                    collections.push(connection.collection('FLO'));

                    mockgoose.reset(next);
                },
                function(next) {
                    expect(Collection.prototype.deleteMany.callCount).to.equal(3);

                    expect(collections.every(function(collection) {
                        return collection.deleteMany.called;
                    })).to.equal(true);

                    next();
                },
            ], done);
        });

        it('does nothing outside of mock-hood', function(done) {
            async.series([
                function(next) {
                    connection = new Connection(CONNECTION_BASE);
                    connection.open(HOST, DB, PORT, next);
                },
                function(next) {
                    mongoose.unmockAndReconnect(next);
                },
                function(next) {
                    collections.push(connection.collection('MOE'));

                    mockgoose.reset(next);
                },
                function(next) {
                    expect(Collection.prototype.deleteMany.callCount).to.equal(0);

                    next();
                },
            ], done);
        });
    });


    describe('unmock', function() {
        var openSpy, _openSpy, closeSpy;
        var connections;

        beforeEach(function() {
            connections = [];

            openSpy = sandbox.spy(ConnectionPrototype, 'open');
            _openSpy = sandbox.spy(ConnectionPrototype, '_open');
            closeSpy = sandbox.spy(ConnectionPrototype, 'close');

            // AFTER we apply the spys
            mockgoose(mongoose, MOCK_OPTIONS);

            expect(mongoose.isMocked).to.equal(true);
            expect(ConnectionPrototype.open).to.not.equal(openSpy);
            expect(ConnectionPrototype._open).to.not.equal(_openSpy);
        });


        it('exists on `mongoose`', function() {
            expect(mongoose.unmock).to.be.instanceof(Function);
        });

        it('works without any Connections', function(done) {
            async.series([
                function(next) {
                    mongoose.unmock(next);
                },
                function(next) {
                    // look!  back to normal
                    expect(mongoose.isMocked).to.equal(undefined);
                    expect(ConnectionPrototype.open).to.equal(openSpy);
                    expect(ConnectionPrototype._open).to.equal(_openSpy);

                    expect(closeSpy.called).to.equal(false);

                    next();
                },
            ], done);
        });

        it('works with Connections', function(done) {
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
                    connections.forEach(function(connection) {
                        expect(connection.host).to.equal(MOCK_HOST);
                        expect(connection.port).to.equal(MOCK_OPTIONS.port);
                        expect(connection.readyState).to.equal(mongoose.STATES.connected);
                    });

                    mongoose.unmock(next);
                },
                function(next) {
                    expect(openSpy.callCount).to.equal(2);
                    expect(_openSpy.callCount).to.equal(2);
                    expect(closeSpy.callCount).to.equal(2);

                    connections.forEach(function(connection) {
                        expect(connection.readyState).to.equal(mongoose.STATES.disconnected);
                    });

                    next();
                },
            ], done);
        });

        it('is cool being called outside of mock-hood', function(done) {
            async.series([
                function(next) {
                    connections.push(new Connection(CONNECTION_BASE));
                    connections[0].open(HOST, DB, PORT, next);
                },
                function(next) {
                    mongoose.unmock(next);
                },
                function(next) {
                    expect(mongoose.isMocked).to.equal(undefined);

                    mongoose.unmock(next);
                },
            ], done);
        });

        it('is cool being called without a callback', function() {
            mongoose.unmock();
        });
    });


    describe('unmockAndReconnect', function() {
        if (! process.env.MOCKGOOSE_LIVE) {
            return;
        }


        var openSpy, _openSpy, closeSpy;
        var connections;

        beforeEach(function() {
            connections = [];

            openSpy = sandbox.spy(ConnectionPrototype, 'open');
            _openSpy = sandbox.spy(ConnectionPrototype, '_open');
            closeSpy = sandbox.spy(ConnectionPrototype, 'close');
        });


        it('exists on `mongoose`', function() {
            mockgoose(mongoose, MOCK_OPTIONS);

            expect(mongoose.unmockAndReconnect).to.be.instanceof(Function);
        });

        it('works without any Connections', function(done) {
            // AFTER we apply the spys
            mockgoose(mongoose, MOCK_OPTIONS);

            async.series([
                function(next) {
                    mongoose.unmockAndReconnect(next);
                },
                function(next) {
                    // look!  back to normal
                    expect(mongoose.isMocked).to.equal(undefined);
                    expect(ConnectionPrototype.open).to.equal(openSpy);
                    expect(ConnectionPrototype._open).to.equal(_openSpy);

                    expect(openSpy.called).to.equal(false);
                    expect(_openSpy.called).to.equal(false);
                    expect(closeSpy.called).to.equal(false);

                    next();
                },
            ], done);
        });

        it('works with Connections', function(done) {
            mockgoose(mongoose, MOCK_OPTIONS);

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
                    connections.forEach(function(connection) {
                        expect(connection.host).to.equal(MOCK_HOST);
                        expect(connection.port).to.equal(MOCK_OPTIONS.port);
                        expect(connection.readyState).to.equal(mongoose.STATES.connected);
                    });

                    mongoose.unmockAndReconnect(next);
                },
                function(next) {
                    expect(openSpy.callCount).to.equal(4);
                    expect(_openSpy.callCount).to.equal(4);
                    expect(closeSpy.callCount).to.equal(2);

                    connections.forEach(function(connection) {
                        expect(connection.host).to.equal(HOST);
                        expect(connection.port).to.equal(PORT);
                        expect(connection.readyState).to.equal(mongoose.STATES.connected);
                    });

                    next();
                },
            ], done);
        });

        it('completes when Connections Error upon reconnect', function(done) {
            // we have non-standard plans for you ...
            openSpy.restore();

            var startThrowing;
            var originalOpen = ConnectionPrototype.open;
            var openStub = sandbox.stub(ConnectionPrototype, 'open', function(
                // yes, there are many call signatures in the Mongoose code,
                //   but this is the only one we actually use below
                host, db, port, cb
            ) {
                if (startThrowing) {
                    return cb(new Error('thrown for ' + db));
                }
                originalOpen.apply(this, arguments);
            });

            // AFTER we apply the spys
            mockgoose(mongoose, MOCK_OPTIONS);

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
                    connections.forEach(function(connection) {
                        expect(connection.host).to.equal(MOCK_HOST);
                        expect(connection.port).to.equal(MOCK_OPTIONS.port);
                        expect(connection.readyState).to.equal(mongoose.STATES.connected);
                    });

                    // it's all downhill from here
                    startThrowing = true;

                    mongoose.unmockAndReconnect(next);
                },
            ], function(err) {
                // the first one
                expect(err.message).to.equal('thrown for ' + DB);

                expect(openSpy.callCount).to.equal(0);
                expect(openStub.callCount).to.equal(4);
                expect(_openSpy.callCount).to.equal(2);
                expect(closeSpy.callCount).to.equal(2);

                connections.forEach(function(connection) {
                    expect(connection.readyState).to.equal(mongoose.STATES.disconnected);
                });

                // the Test Case will fail on multipe calls to done if we haven't crafted our code right
                done();
            });
        });

        it('is cool being called outside of mock-hood', function(done) {
            mockgoose(mongoose, MOCK_OPTIONS);

            async.series([
                function(next) {
                    connections.push(new Connection(CONNECTION_BASE));
                    connections[0].open(HOST, DB, PORT, next);
                },
                function(next) {
                    mongoose.unmock(next);
                },
                function(next) {
                    expect(mongoose.isMocked).to.equal(undefined);

                    mongoose.unmockAndReconnect(next);
                },
            ], done);
        });

        it('is cool being called without a callback', function() {
            mockgoose(mongoose, MOCK_OPTIONS);

            mongoose.unmockAndReconnect();
        });
    });
});
