var mongoose = require('mongoose');
var path = require('path');
var mockgoose = require(path.join(__dirname, '../Mockgoose'));
var expect = require('chai').expect;

var Cat = mongoose.model('Cat', {
  name: {
    type: String,
    index: {
      unique: true
    }
  }
});


// BUG: will not show `Cannot find module 'this-module-not-found'` error
describe('bug 58', function () {
  before(function (done) {
    mockgoose(mongoose).then(function () {
      mongoose.connect('mongodb://localhost:27017/test', function () {
        done();
      });
    });
  });

  beforeEach(function (done) {
    mockgoose.reset(function () {
      Cat.create({
        name: 'foo'
      }, function (err, cat1) {
        if (err) return done(err);
        Cat.create({
          name: 'bar'
        }, function (err, cat2) {
          done(err);
        });
      });
    });
  });

  it('should throw an error on create', function (done) {
    Cat.create({
      name: 'foo'
    }, function (err, cat) {
      expect(err).to.be.an('error')
      done();
    });
  });

  it('should throw an error on save new', function (done) {
    const cat = new Cat({
      name: 'foo'
    });
    cat.save(function (err) {
      expect(err).to.be.an('error')
      done();
    });
  });

  it('should throw an error on save existing', function (done) {
    Cat.findOne({
      name: 'bar'
    }, function (err, cat) {
      if (err) return done(err);
      cat.name = 'foo';
      cat.save(function (err) {
        expect(err).to.be.an('error')
        done();
      });
    });
  });

  it('should throw an error on update', function (done) {
    Cat.update({ name: 'bar' }, { name: 'foo' }, function (err, raw) {
      expect(err).to.be.an('error')
      done();
    });
  });
});
