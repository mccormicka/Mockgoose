describe('Mockgoose $nin', function () {
    'use strict';

    var mockgoose = require('../../../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
	mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB');

    var Schema = new mongoose.Schema({
        name: String,
        qty: [Number]
    });
    var NinModel = mongoose.model('NinModel', Schema);

    beforeEach(function (done) {
        mockgoose.reset();
        NinModel.create(
            {
                name: '5',
                qty: [5, 10, 15]
            },
            {
                name: '15',
                qty: [1, 15]
            },
            {
                name: '0',
                qty: [5, 8]
            },
            {
                name: '50',
                qty: [7, 8]
            },
            {
                name: '55',
                qty: [7, 21]
            }, function(err){
                done(err);
            });
    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('$nin', function () {

        it('Does not equal 5 or 15 in array', function (done) {
            NinModel.find({ qty: { $nin: [ 5, 15 ] } }).exec().then(function (results) {
                expect(results.length).toBe(2);
                done();
            });
        });

        it('Does not equal 5 or 15 in field', function (done) {
            NinModel.find({ name: { $nin: [ '5', '15' ] } }).exec().then(function (results) {
                expect(results.length).toBe(3);
                done();
            });
        });
    });

    describe('ObjectIds', function() {
        var schema = new mongoose.Schema({
            myRefs: [
                {type: mongoose.Schema.Types.ObjectId}
            ]
        });
        var Test = mongoose.model('NINObjectIdTest', schema);
        var myIds = [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()];

        it('works with ObjectIds', function(done) {
            Test.create({myRefs: myIds}, function(er, test) {
                Test.findOne({ myRefs: { $nin: [mongoose.Types.ObjectId()] } }, function(er, result) {
                    expect(er).toBeNull();
                    expect(result._id.toString()).toBe(test._id.toString());
                    done();
                });
            });
        });

    });
});