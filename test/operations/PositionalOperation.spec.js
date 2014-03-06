describe('Mockgoose $ positional Tests', function () {
    'use strict';

    var _ = require('lodash');
    var mockgoose = require('./../../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB');

    var StudentSchema = new mongoose.Schema({
        _id: Number,
        grades: [
            {type: Number}
        ]
    });
    var Student = mongoose.model('Students', StudentSchema);

    var AdvancedStudentSchema = new mongoose.Schema({
        _id: Number,
        grades: [
            {grade: Number, mean: Number, std: Number}
        ]
    });
    var AdvancedStudent = mongoose.model('AdvancedStudents', AdvancedStudentSchema);

    beforeEach(function (done) {
        mockgoose.reset();
        Student.create({ '_id': 1, 'grades': [ 80, 85, 90 ] },
            { '_id': 2, 'grades': [ 88, 90, 92 ] },
            { '_id': 3, 'grades': [ 85, 100, 90 ] },
            function (err) {
                done(err);
            });

    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('update', function () {

        it('Be able to update value with the positional $ operator', function (done) {
            Student.update({ _id: 1, grades: 80 }, { $set: { 'grades.$': 82 } }).exec().then(function () {
                Student.findById(1).exec().then(function (result) {
                    expect(result.grades).toContain(82);
                    expect(result.grades).toContain(85);
                    expect(result.grades).toContain(90);
                    done();
                });
            });
        });

        it('Be able to update a field value with the positional $ operator', function (done) {

            AdvancedStudent.create({ '_id': 4, 'grades': [
                { grade: 80, mean: 75, std: 8 },
                { grade: 85, mean: 90, std: 5 },
                { grade: 90, mean: 85, std: 3 }
            ] }).then(function () {
                    AdvancedStudent.update({ _id: 4, 'grades.grade': 85},
                        { $set: { 'grades.$.std': 6 } }).exec().then(function () {
                            AdvancedStudent.findById(4).exec().then(function(result){
                                _.each(result.grades, function(results){
                                    if(results.grade === 90){
                                        expect(result.grades[1].std).toBe(6);
                                        done();
                                    }
                                });
                            });
                        });
                });
        });
    });
});