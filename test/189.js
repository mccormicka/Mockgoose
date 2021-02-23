"use strict";

describe('callback', function todoDescribe() {
  var Mongoose = require('mongoose').Mongoose;
  var Mockgoose = require('../built/mockgoose').Mockgoose;
  var mongoose = new Mongoose();
  var mockgoose = new Mockgoose(mongoose);
  
  before(function(done) {
  	mockgoose.prepareStorage().then(function() {
    	mongoose.connect('mongodb://localhost/mydb', { useNewUrlParser: true }, function() {
        done(); 
    	});
	  });
  });

  it('should call callback by reset', function(done) {
    mockgoose.helper.reset().then(function() {
      done();
    });
  });

  it('should call callback by model create', function(done) {
    var SomeSchemaFactory= mongoose.Schema;
    var SomeSchema= new SomeSchemaFactory({
      item1: String,
      item2: String,
    });
    var MyModel= mongoose.model('MyModel', SomeSchema);
    var someDoc = {
      item1: String,
      item2: String,
    };
    MyModel.create(someDoc, done);
  });

  it('should work with empty callback', function(){
    mockgoose.helper.reset();
  });
});
