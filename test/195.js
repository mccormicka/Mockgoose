"use strict";

var expect = require('chai').expect;

describe('callback', function todoDescribe() {
  var Mongoose = require('mongoose').Mongoose;
  var mockgoose = require('../Mockgoose');
  var mongoose = new Mongoose();
  
  it('should return native connection object', function(done) {
  	mockgoose(mongoose).then(function() {
    	    var connection = mongoose.createConnection('mongodb://localhost/mydb');
            expect(typeof connection).to.equal('object'); 
            expect(connection.constructor.name).to.equal('NativeConnection'); 
            done();
	});
  });

});
