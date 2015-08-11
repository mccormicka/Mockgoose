/*jshint expr: true*/
/*jshint -W079 */ //redefined expect
var expect = require('chai').expect;

describe('Mockgoose Update Tests', function () {
    'use strict';

    var mockgoose = require('..');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB');
    var AccountModel = require('./models/AccountModel')(mongoose);
    var SimpleModel = require('./models/SimpleModel')(mongoose);

    beforeEach(function (done) {
        mockgoose.reset();
        AccountModel.create(
            {email: 'valid@valid.com', password: 'password'},
            {email: 'invalid@invalid.com', password: 'password'},
            function (err, models) {
                expect(err).not.to.be.ok;
                expect(models).to.be.ok;
                SimpleModel.create(
                    {name: 'one', value: 'one'},
                    {name: 'one', value: 'two'},
                    {name: 'one', value: 'two'},
                    {name: 'two', value: 'one'},
                    {name: 'two', value: 'two'},
                    function (err, models) {
                        expect(err).not.to.be.ok;
                        expect(models).to.be.ok;
                        done(err);
                    }
                );
            });

    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('Update', function () {

        it('should be able to update items', function (done) {
            AccountModel.create({email: 'testing@testing.com', password: 'password', values: ['one', 'two']}, function (err, model) {
                expect(model).not.to.be.undefined;
                if (model) {
                    AccountModel.update({email: 'testing@testing.com'}, {email: 'updated@testing.com'}, function (err, result) {
                        expect(result).to.equal(1);
                        AccountModel.findOne({email: 'updated@testing.com'}, function (err, result) {
                            if (result) {
                                expect(result.email).to.equal('updated@testing.com');
                                done(err);
                            } else {
                                done('Error finding models');
                            }
                        });
                    });
                } else {
                    done(err);
                }
            });
        });

        it('Have the same _id after doing an update', function (done) {
            AccountModel.create({email: 'testing@testing.com', password: 'password', values: ['one', 'two']}, function (err, model) {
                expect(model).not.to.be.undefined;
                if (model) {
                    model.update({email: 'updated@testing.com'}, function (err, result) {
                        expect(result).to.equal(1);
                        AccountModel.findOne({_id: model._id}, function (err, result) {
                            expect(result).not.to.be.undefined;
                            if (result) {
                                expect(result.email).to.equal('updated@testing.com');
                            }
                            done(err);
                        });
                    });
                } else {
                    done(err);
                }

            });
        });

        it('Should have an error when mongoose is disconnected', function (done) {
            AccountModel.create({email: 'testing@testing.com', password: 'password', values: ['one', 'two']}, function (err, model) {
                expect(model).not.to.be.undefined;
                if (model) {
                    mockgoose.setMockReadyState(mongoose.connection, 0);

                    model.update({email: 'updated@testing.com'}, function (err, result) {
                        expect(err).not.to.be.undefined;
                        expect(result).to.be.undefined;
                        mockgoose.setMockReadyState(mongoose.connection, 1);
                        done();
                    });
                } else {
                    done(err);
                }

            });
        });
    });

    describe('$pull', function () {

        it('should be able to pull items from nested documents array', function (done) {
            AccountModel.create(
                {email: 'tester@valid.com', password: 'password', values: ['one', 'two']},
                function () {
                    AccountModel.findOneAndUpdate({email: 'tester@valid.com'}, {$pull: {values: 'one'}}, function (err, result) {
                        expect(result).not.to.be.undefined;
                        if (result) {
                            expect(result.values.length).to.equal(1);
                            expect(result.values[0]).to.equal('two');
                            done(err);
                        } else {
                            done('Error finding item');
                        }
                    });
                });
        });

        it('should be able to pull items from nested documents array by property', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: [
                    {name: 'one'},
                    {name: 'two'}
                ]},
                function () {
                    AccountModel.findOneAndUpdate({email: 'multiples@valid.com'}, {$pull: {values: {name: {$in: ['one']}}}}, function (err, result) {
                        expect(result).not.to.be.undefined;
                        if (result) {
                            expect(result.values.length).to.equal(1);
                            if (result.values.length === 1) {
                                expect(result.values[0].name).to.equal('two');
                                done(err);
                            } else {
                                done('Invalid value length', result.values);
                            }
                        } else {
                            done('Error finding models');
                        }
                    });
                });
        });

        it('should be able to pull multiple items from nested documents array by property', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: [
                    {name: 'one'},
                    {name: 'two'},
                    {name: 'three'}
                ]},
                function () {
                    AccountModel.findOneAndUpdate({email: 'multiples@valid.com'}, {$pull: {values: {name: {$in: ['one', 'two']}}}}, function (err, result) {
                        expect(result).not.to.be.undefined;
                        if (result) {
                            expect(result.values.length).to.equal(1);
                            if (result.values.length === 1) {
                                expect(result.values[0].name).to.equal('three');
                                done(err);
                            } else {
                                done('invalid values length');
                            }
                        } else {
                            done('Error finding models');
                        }
                    });
                });
        });
    });

    describe('$push', function () {

        it('should be able to use $push with a static update', function (done) {
            AccountModel.create({email: 'pushed@pushed.com', password: 'password', values: [
                    {name: 'one'},
                    {name: 'two'},
                    {name: 'three'}
                ]},
                function (err, result) {
                    expect(err).not.to.be.ok;
                    expect(result).not.to.be.undefined;
                    if (result) {
                        AccountModel.update({email: 'pushed@pushed.com'}, {$push: {values: {name: 'pushed'}}}, function (err, result) {
                            expect(err).not.to.be.ok;
                            expect(result).to.equal(1);
                            if (result) {
                                AccountModel.findOne({email: 'pushed@pushed.com'}, function (err, pushed) {
                                    expect(err).not.to.be.ok;
                                    if (pushed) {
                                        expect(pushed.values[3]).to.deep.equal({name: 'pushed'});
                                        done(err);
                                    } else {
                                        done('Error finding model');
                                    }
                                });
                            } else {
                                done('Error updating model with $push');
                            }
                        });
                    } else {
                        done('Error creating model');
                    }
                });
        });

        it('should be able to use $push with a update', function (done) {
            AccountModel.create({email: 'pushed@pushed.com', password: 'password', values: [
                    {name: 'one'},
                    {name: 'two'},
                    {name: 'three'}
                ]},
                function (err, result) {
                    expect(err).not.to.be.ok;
                    expect(result).not.to.be.undefined;
                    if (result) {
                        result.update({$push: {values: {name: 'pushed'}}}, function (err, result) {
                            expect(err).not.to.be.ok;
                            expect(result).to.equal(1);
                            if (result) {
                                AccountModel.findOne({email: 'pushed@pushed.com'}, function (err, pushed) {
                                    expect(err).not.to.be.ok;
                                    if (pushed) {
                                        expect(pushed.values.length).to.equal(4);
                                        expect(pushed.values[3]).to.deep.equal({name: 'pushed'});
                                        done(err);
                                    } else {
                                        done('Error finding model');
                                    }
                                });
                            } else {
                                done('Error updating model with $push');
                            }
                        });
                    } else {
                        done('Error creating model');
                    }
                });
        });

        it('should be able to use $push with an $each', function (done) {
            AccountModel.create({email: 'pushed@pushed.com', password: 'password', values: [
                    {name: 'one'},
                    {name: 'two'},
                    {name: 'three'}
                ]},
                function (err, result) {
                    expect(err).not.to.be.ok;
                    expect(result).not.to.be.undefined;
                    if (result) {
                        result.update({$push: {values: {$each: [
                            {name: 'pushed'},
                            {name: 'pushed2'}
                        ]}}}, function (err, result) {
                            expect(err).not.to.be.ok;
                            expect(result).to.equal(1);
                            if (result) {
                                AccountModel.findOne({email: 'pushed@pushed.com'}, function (err, pushed) {
                                    expect(err).not.to.be.ok;
                                    if (pushed) {
                                        expect(pushed.values.length).to.equal(5);
                                        expect(pushed.values[4]).to.deep.equal({name: 'pushed2'});
                                        done(err);
                                    } else {
                                        done('Error finding model');
                                    }
                                });
                            } else {
                                done('Error updating model with $push');
                            }
                        });
                    } else {
                        done('Error creating model');
                    }
                });
        });

        it('should be able to use $push with a multi 0  update', function (done) {
            AccountModel.create({email: 'aaa@pushed.com', password: 'password', values: ['one', 'two', 'three']},
                function (err, result) {
                    expect(err).not.to.be.ok;
                    expect(result).not.to.be.undefined;
                    if (result) {
                        AccountModel.update({}, {$push: {values: 'pushed'}}, {multi: 0, sort:{email:1}}, function (err, result) {
                            expect(err).not.to.be.ok;
                            expect(result).to.equal(1);
                            if (result) {
                                AccountModel.find({values: {$in: ['pushed']}}, function (err, pushed) {
                                    expect(err).not.to.be.ok;
                                    if (pushed) {
                                        expect(pushed.length).to.equal(1);
                                        expect(pushed[0].values).to.contain('pushed');
                                        done(err);
                                    } else {
                                        done('Error finding model');
                                    }
                                });
                            } else {
                                done('Error updating model with $push');
                            }
                        });
                    } else {
                        done('Error creating model');
                    }
                });
        });

        it('should be able to use $push with a multi 1  update', function (done) {
            AccountModel.create({email: 'pushed@pushed.com', password: 'password', values: ['one', 'two', 'three']},
                function (err, result) {
                    expect(err).not.to.be.ok;
                    expect(result).not.to.be.undefined;
                    if (result) {
                        AccountModel.update({}, {$push: {values: 'pushed'}}, {multi: 1}, function (err, result) {
                            expect(err).not.to.be.ok;
                            expect(result).to.equal(3);
                            if (result) {
                                AccountModel.find({values: {$in: ['pushed']}}, function (err, pushed) {
                                    expect(err).not.to.be.ok;
                                    if (pushed) {
                                        expect(pushed.length).to.equal(3);
                                        if (pushed.length === 3) {
                                            expect(pushed[2].values).to.contain('pushed');
                                            done(err);
                                        } else {
                                            done('error finding pushed items!' + pushed);
                                        }

                                    } else {
                                        done('Error finding model');
                                    }
                                });
                            } else {
                                done('Error updating model with $push');
                            }
                        });
                    } else {
                        done('Error creating model');
                    }
                });
        });
    });

    describe('upsert', function () {

        it('should be able to findOneAndUpdate with an upsert', function (done) {
            SimpleModel.findOneAndUpdate({name: 'upsert'}, {name: 'upsert'}, {upsert: true}, function (err, result) {
                expect(err).not.to.be.ok;
                expect(result).to.be.ok;
                if (result) {
                    expect(result.name).to.equal('upsert');
                    SimpleModel.findOne({name: 'upsert'}, function (err, result) {
                        expect(err).not.to.be.ok;
                        expect(result).to.be.ok;
                        if (result) {
                            expect(result.name).to.equal('upsert');
                            done(err);
                        } else {
                            done('Unable to find ' + err + result);
                        }
                    });
                } else {
                    done(err);
                }
            });
        });

        it('should not be able to findOneAndUpdate without an upsert', function (done) {
            SimpleModel.findOneAndUpdate({name: 'upsert'}, {name: 'upsert'}, {upsert: false}, function (err, result) {
                expect(err).not.to.be.ok;
                expect(result).to.be.null;
                done(err);
            });
        });
    });

    describe('Bugs', function () {
        describe('#34 update nested values', function () {
            /*jshint -W106*///camelCase
            var Bug34Schema = new mongoose.Schema(
                {
                    access_token: {
                        key: String,
                        expiration: Date
                    }
                }
            );
            var Model = mongoose.model('Bug34', Bug34Schema);

            beforeEach(function(done){
                Model.create({
                    access_token:{
                        key:'token',
                        expiration:new Date()
                    }
                }, done);
            });

            it('Update nested value', function (done) {
                Model.findOneAndUpdate({'access_token.key' : 'token'}, {'access_token.expiration' : null}).exec().then(function(data){
                    expect(data._doc['access_token.expiration']).to.equal(undefined);
                    expect(data.access_token.expiration).to.equal(null);
                    done();
                });
            });

        });

        describe('#35 update array item', function () {
            var bugSchema, ContractModel;
            before(function(done) {

                bugSchema = new mongoose.Schema(
                    {
                        name: [String],
                        titles: [
                            {
                                _id: Number,
                                name: String,
                                episodeType: String,
                                runs: Number,
                                flights: [
                                    {start: Date, ends: Date, _id: Number}
                                ]
                            }
                        ]
                    }
                );
                ContractModel = mongoose.model('Bug35', bugSchema);
                done();
            });

            var contract;
            beforeEach(function (done) {
                ContractModel.create({
                    name: 'V series',
                    titles: [
                        {
                            _id: 1,
                            name: 'Invasion'
                        },
                        {
                            _id: 2,
                            name: 'Rebellion'
                        },
                        {
                            _id: 3,
                            name: 'Spies Among Us'
                        }
                    ]
                }, function (err, result) {
                    contract = result;
                    done();
                });
            });

            afterEach(function (done) {
                //Reset the database after every test.
                mockgoose.reset();
                done();
            });

            it('should accept a number', function (done) {
                contract.titles[0].runs = 11;
                contract.save(function (err, result) {
                    expect(err).not.to.be.ok;
                    expect(result).not.to.be.undefined;
                    expect(result.titles.id(1).runs).to.equal(11); //all good here.
                    done();
                });
            });

            it('should not be stored in weird string property outside of titles', function (done) {
                contract.titles[0].runs = 11;
                contract.save(function (err, result) {
                    expect(err).not.to.be.ok;
                    expect(result).not.to.be.undefined;
                    expect(result.titles.id(1).runs).to.equal(11); //all good here.
                    ContractModel.find({}, function (err, results) {
                        var result = results[0];
                        expect(result._doc['titles.0.runs']).to.equal(undefined);
                        expect(result.titles.id(1).runs).to.equal(11);
                        done();
                    });
                });
            });

            it('should update nested array', function (done) {
                var flight = {start:new Date(), ends: new Date(), _id:5};
                contract.titles[0].flights.push(flight);
                contract.save(function (err, result) {
                    expect(err).not.to.be.ok;
                    expect(result).not.to.be.undefined;
                    expect(result.titles.id(1).flights[0]._id).to.equal(flight._id); //all good here.
                    done();
                });
            });
        });

        describe('#54 https://github.com/mccormicka/Mockgoose/issues/54', function () {

            var bugSchema = new mongoose.Schema(
                {
                    name: String,
                    age:Number
                }
            );
            var Model = mongoose.model('Bug54', bugSchema);

            afterEach(function (done) {
                //Reset the database after every test.
                mockgoose.reset();
                done();
            });

            it('pass conditions to upsert', function (done) {
                Model.findOneAndUpdate({name:'updateName'}, {age:35}, {upsert:true}).exec().then(function(model){
                    expect(model.name).to.equal('updateName');
                    expect(model.age).to.equal(35);
                    done();
                });
            });
        });

        describe('#67 https://github.com/mccormicka/Mockgoose/pull/67', function () {

            var uniqueIndexSchema = new mongoose.Schema(
                {
                    name: String,
                    title: { type: String, unique: true }
                }
            );
            var Model = mongoose.model('Bug67', uniqueIndexSchema);

            afterEach(function (done) {
                //Reset the database after every test.
                mockgoose.reset();
                done();
            });

            it('should generate duplicate key error on upsert', function (done) {
                Model.findOneAndUpdate({name:'name1'}, {title:'unique'}, {upsert:true}, function (err, model) {
                    expect(model.name).to.equal('name1');
                    expect(model.title).to.equal('unique');

                    Model.findOneAndUpdate({name:'name2'}, {title:'unique'}, {upsert:true}, function (err, model) {
                        expect(err).not.to.be.undefined;
                        expect(model).to.be.undefined;
                        done();
                    });
                });
            });
        });

        describe('#131 https://github.com/mccormicka/Mockgoose/issues/131', function () {

            var Schema = new mongoose.Schema(
                {
                    name: String
                }
            );

            var Model = mongoose.model('Bug69', Schema);

            afterEach(function (done) {
                mockgoose.reset();
                done();
            });

            it('should clone correctly model', function (done) {
                Model.update({
                    name: 'foo'
                }, {
                    name: 'foo'
                }, {
                    upsert: true
                }, function(err, update) {
                    expect(err).not.to.be.undefined;
                    expect(update).to.eql(1);

                    Model.count(function(err, count) {
                        expect(err).not.to.be.undefined;
                        expect(count).to.eql(1);

                        Model.update({
                            name: 'foo'
                        }, {
                            name: 'bar'
                        }, function(err, update) {
                            expect(err).not.to.be.undefined;
                            expect(update).to.eql(1);

                            Model.count(function(err, count) {
                                expect(err).not.to.be.undefined;
                                expect(count).to.eql(1);

                                done(err);
                            });
                        });
                    });
                });
            });
        });

    });
});
