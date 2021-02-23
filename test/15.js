'use strict';

var mongoose = require('mongoose');
var Mockgoose = require('../built/mockgoose').Mockgoose;
var expect = require('chai').expect;
var mockgoose = new Mockgoose(mongoose);
var CatSchema = new mongoose.Schema({name: String});
var Cat1;
var Cat2;

// create connection to first database
describe('bug 15', function() {
  
  before("DB1 connection", function () {
    return mockgoose.prepareStorage().then(function() {
      return mongoose.createConnection("mongodb://barbaz", { useNewUrlParser: true });
    }).then(function(db1) {
      Cat1 = db1.model('Cat', CatSchema);
    });
  }); 
  
  // create connection to second database
  before("DB2 connection", function () {
    return mockgoose.prepareStorage().then(function() {
      return mongoose.createConnection("mongodb://foobar", { useNewUrlParser: true });
    }).then(function (db2) {
      Cat2 = db2.model('Cat', CatSchema);
    });
  });
  
  it("should create a cat foo", function(done) {
    Cat1.create({
      name: "foo"
    }, function(err) {
      expect(err).not.to.be.ok;
      done(err);
    });
  });
  
  it("should find cat foo", function(done) {
    Cat1.findOne({name: "foo"}, function(err) {
      expect(err).not.to.be.ok;
      done(err);
    });
  });
  
  // remove collections from a temporary store
  after("Drop db", function(done) {
    // Here is when the error is trigged
    mockgoose.helper.reset().then(function() {
      done();
    });
  });
});
