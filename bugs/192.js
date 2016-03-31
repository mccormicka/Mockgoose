"use strict";

var expect = require('chai').expect;
var Mongoose = require('mongoose').Mongoose;
var mockgoose = require('../Mockgoose');
var mongoose = new Mongoose();
mockgoose(mongoose);

before(function(done) {
  console.log('inside before!');
  mongoose.connect('mongodb://localhost/mydb', function() {
      console.log('connected');
      done(); 
  });
});

describe('callback', function todoDescribe() {
  var modelSchema = new Schema({
      name: {
          type: Schema.Types.String,
          trim: true,
          select: true,
          unique: true,
          required: true,
          minlength: 4,
          maxlength: 30
      }
  })

  
  it( 'Creating a document with a duplicate name', function( done ) {
      Mymodel.createDoc( { name: 'Foo Bar Baz' }, function ( err1, data1 ) {
          expect( err1 ).to.equal( null )
  
          Mymodel.createDoc( { name: 'Foo Bar Baz' }, function ( err2, data2 ) {
              expect( err2 ).to.not.equal( null )
              done()
          })
      })
  })

});
