ddescribe('$(update)', function () {
    'use strict';

    var mockgoose = require('./../../../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB');

    describe('Bugs', function () {

        describe('#46 https://github.com/mccormicka/Mockgoose/issues/46', function () {

            var Schema = new mongoose.Schema({
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
                Model.create({
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
                }).then(done);
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
    });
});
