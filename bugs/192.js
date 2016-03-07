"use strict";


describe('callback', function todoDescribe() {
  const Mongoose = require('mongoose').Mongoose;
  let mockgoose = require('../Mockgoose');
  let mongoose = new Mongoose();
  mockgoose(mongoose);
  
  before(function(done) {
    mongoose.connect('mongodb://localhost/mydb', function() {
        done(); 
    });
  });

  const modelSchema = new Schema({
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
      Mymodel.createDoc( { name: 'Foo Bar Baz' }, ( err1, data1 ) => {
          expect( err1 ).to.equal( null )
  
          Mymodel.createDoc( { name: 'Foo Bar Baz' }, ( err2, data2 ) => {
              expect( err2 ).to.not.equal( null )
              done()
          } )
      } )
  })

});
