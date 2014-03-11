ddescribe('Mockgoose $nin', function () {
    'use strict';

    var mockgoose = require('../../../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
//	mockgoose(mongoose);
    mongoose.createConnection('mongodb://localhost/TestingDB2');

    var StudentSchema = new mongoose.Schema({
        _id: Number,
        grades: [
            {type: Number}
        ]
    });
    var Student = mongoose.model('Students', StudentSchema);

    beforeEach(function (done) {
        mockgoose.reset();
        Student.create({ '_id': 1, 'grades': [ 80, 85, 90 ] },
            { '_id': 2, 'grades': [ 88, 90, 92 ] },
            { '_id': 3, 'grades': [ 85, 100, 90 ] },
            function (err) {
                done(err);
            });

    });

    var Schema = new mongoose.Schema({
        name: String,
        qty: [
            {type: Number}
        ]
    });
    var Model = mongoose.model('TESTING', Schema);

    beforeEach(function (done) {
        mockgoose.reset();
        Model.create(
//            {
//                name: '5',
//                qty: [5, 10, 15]
//            },
//            {
//                name: '15',
//                qty: [1, 15]
//            },
//            {
//                name: '0',
//                qty: [5, 8]
//            },
//            {
//                name: '50',
//                qty: [7, 8]
//            },
            {
                name: '55',
                qty: [7, 21]
            }, function (err) {
                done(err);
            });
    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('', function () {

        it('Does not equal 5 or 15 in array', function (done) {
            Model.find({ qty: { $nin: [ 5, 15 ] } }).exec().then(function (results) {
                expect(results.length).toBe(2);
                done();
            });
        });

        it('Does not equal 5 or 15 in field', function (done) {
            Model.find({ name: { $nin: [ '5', '15' ] } }).exec().then(function (results) {
                expect(results.length).toBe(3);
                done();
            });
        });
    });
});