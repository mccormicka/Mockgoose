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

  it('should call callback by reset', (done) => {
    mockgoose.reset(function(err) {
       done();
    });
  });

  it('should call callback by model create', (done) => {
    const SomeSchemaFactory= mongoose.Schema;
    const SomeSchema= new SomeSchemaFactory({
      item1: String,
      item2: String,
    });
    const MyModel= mongoose.model('MyModel', SomeSchema);
    const someDoc = {
      item1: String,
      item2: String,
    };
    MyModel.create(someDoc, done);
  });

  it('should work with empty callback', ()=>{
    mockgoose.reset();
  });
});
