const mongoose = require('mongoose');
const mockgoose = require('../mockgoose');
const expect = require('chai').expect;

mockgoose( mongoose )

// Create the mongoose connection on init
before(function(done) {
    mongoose.connect('mongodb://example.com/TestingDB', function(err) {
        done(err)
    })
});

// Close the fake connection after all tests are done
after(function(done) {
    console.log('Closing') // Shows in console (always)
    mongoose.connection.close(function() {
        console.log('Closed') // Also. always shows in console
        done()
    })
})


describe('Foobar', function () {
    describe('.createFoo', function () {
        it( 'Creating foo with no data', function( done ) {
            expect( null ).to.not.equal( null );
            done();
        })
    });
});
