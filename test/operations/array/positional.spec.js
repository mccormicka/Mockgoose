describe('$(update) http://docs.mongodb.org/manual/reference/operator/update/positional/', function () {
    'use strict';

    var mockgoose = require('./../../../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB');

    describe('$(update)', function () {
        var Schema = new mongoose.Schema({
            _id: Number,
            grades: [Number],
            gradeDetails: [
                {
                    grade: Number,
                    mean: Number,
                    std: Number
                }
            ]
        });

        var Model = mongoose.model('UpdateModel', Schema);

        beforeEach(function (done) {
            mockgoose.reset();
            Model.update({'_id': 1},
                { 'grades': [ 80, 85, 90 ],
                    'gradeDetails': [ { grade: 80, mean: 75, std: 8 }, { grade: 85, mean: 90, std: 5 }, { grade: 90, mean: 85, std: 3 }]
                }, {upsert: true}, done);
        });

        it('Update first item', function (done) {
            Model.update({ _id: 1, grades: 80 }, { $set: { 'grades.$': 82 } }).exec().then(function () {
                Model.findById(1).exec().then(function (model) {
                    expect(model.grades[0]).toBe(82);
                    done();
                });
            });
        });

        it('Update nested fields', function (done) {
            Model.update({ _id: 1, 'gradeDetails.grade': 85 }, { $set: { 'gradeDetails.$.std': 6 } }).exec().then(function () {
                Model.findById(1).exec().then(function (model) {
                    expect(model.gradeDetails[1].std).toBe(6);
                    done();
                });
            });
        });
    });

    describe('Bugs', function () {

        describe('#46 https://github.com/mccormicka/Mockgoose/issues/46', function () {

            var Schema = new mongoose.Schema({
                _id:Number,
                p: String,
                grps: [
                    {
                        grpId: String,
                        attrs: [
                            {
                                attrId: String
                            }
                        ]
                    }
                ]
            });

            var Model = mongoose.model('Bug_46', Schema);

            beforeEach(function (done) {
                mockgoose.reset();
                Model.update({'_id': 1},
                    {
                        p: 'SomeId',
                        grps: [
                            {
                                grpId: 'SomeGrpId',
                                attrs: [
                                    {
                                        attrId: 'SomeAttrId'
                                    }
                                ]
                            }
                        ]
                    }, {upsert: true}, done);
            });

            it('Not throw an error when using the update positional operator.', function (done) {
                expect(function () {
                    Model.findOneAndUpdate({ p: 'SomeId', 'grps.grpId': 'SomeGrpId' }, {
                        '$push': {
                            'grps.$.attrs': {
                                attrId: 'SomeNewAttrId'
                            }
                        }
                    }).exec().then(function (model) {
                            expect(model.grps[0].attrs[1].attrId).toBe('SomeNewAttrId');
                            done();
                        });
                }).not.toThrow();
            });
        });

        describe('#47 https://github.com/mccormicka/Mockgoose/issues/47', function () {

            var Schema = new mongoose.Schema({
                _id:Number,
                p: String,
                grps: [
                    {
                        grpId: String,
                        attrs: [
                            {
                                attrId: String
                            }
                        ]
                    }
                ]
            });

            var Model = mongoose.model('Bug_47', Schema);

            beforeEach(function (done) {
                mockgoose.reset();
                Model.update({'_id': 1},
                    {
                        p: 'SomeId',
                        grps: [
                            {
                                grpId: 'SomeGrpId',
                                attrs: [
                                    {
                                        attrId: 'SomeAttrId'
                                    }
                                ]
                            }
                        ]
                    }, {upsert: true}, done);
            });

            it('$Pull does not work with nested arrays and positional operator', function (done) {
                expect(function () {
                    Model.findOneAndUpdate({ p: 'SomeId', 'grps.grpId': 'SomeGrpId' }, {
                        '$pull': {
                            'grps.$.attrs': {
                                attrId: 'SomeAttrId'
                            }
                        }
                    }).exec().then(function (model) {
                            expect(model.grps[0].attrs.length).toBe(0);
                            done();
                        });
                }).not.toThrow();
            });
        });
    });
});
