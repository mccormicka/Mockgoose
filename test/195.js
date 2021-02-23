"use strict";

var expect = require('chai').expect;

describe('callback', function todoDescribe() {
  var Mongoose = require('mongoose').Mongoose;
  var Mockgoose = require('../built/mockgoose').Mockgoose;
  var mongoose = new Mongoose();
  var mockgoose = new Mockgoose(mongoose);
  
  it('should return native connection object', function(done) {
  	mockgoose.prepareStorage().then(function() {
      var connection = mongoose.createConnection('mongodb://localhost/mydb', { useNewUrlParser: true });
      expect(typeof connection).to.equal('object'); 
      expect(connection.constructor.name).to.equal('NativeConnection'); 
      done();
	  });
  });
});
