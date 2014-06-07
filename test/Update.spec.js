describe('Mockgoose Update Tests', function () {
    'use strict';

    var mockgoose = require('../Mockgoose');
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
                expect(err).toBeFalsy();
                expect(models).toBeTruthy();
                SimpleModel.create(
                    {name: 'one', value: 'one'},
                    {name: 'one', value: 'two'},
                    {name: 'one', value: 'two'},
                    {name: 'two', value: 'one'},
                    {name: 'two', value: 'two'},
                    function (err, models) {
                        expect(err).toBeFalsy();
                        expect(models).toBeTruthy();
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
                expect(model).toBeDefined();
                if (model) {
                    AccountModel.update({email: 'testing@testing.com'}, {email: 'updated@testing.com'}, function (err, result) {
                        expect(result).toBe(1);
                        AccountModel.findOne({email: 'updated@testing.com'}, function (err, result) {
                            if (result) {
                                expect(result.email).toBe('updated@testing.com');
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
                expect(model).toBeDefined();
                if (model) {
                    model.update({email: 'updated@testing.com'}, function (err, result) {
                        expect(result).toBe(1);
                        AccountModel.findOne({_id: model._id}, function (err, result) {
                            expect(result).toBeDefined();
                            if (result) {
                                expect(result.email).toBe('updated@testing.com');
                            }
                            done(err);
                        });
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
                        expect(result).toBeDefined();
                        if (result) {
                            expect(result.values.length).toBe(1);
                            expect(result.values[0]).toBe('two');
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
                        expect(result).toBeDefined();
                        if (result) {
                            expect(result.values.length).toBe(1);
                            if (result.values.length === 1) {
                                expect(result.values[0].name).toBe('two');
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
                        expect(result).toBeDefined();
                        if (result) {
                            expect(result.values.length).toBe(1);
                            if (result.values.length === 1) {
                                expect(result.values[0].name).toBe('three');
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
                    expect(err).toBeNull();
                    expect(result).toBeDefined();
                    if (result) {
                        AccountModel.update({email: 'pushed@pushed.com'}, {$push: {values: {name: 'pushed'}}}, function (err, result) {
                            expect(err).toBeNull();
                            expect(result).toBe(1);
                            if (result) {
                                AccountModel.findOne({email: 'pushed@pushed.com'}, function (err, pushed) {
                                    expect(err).toBeNull();
                                    if (pushed) {
                                        expect(pushed.values[3]).toEqual({name: 'pushed'});
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
                    expect(err).toBeNull();
                    expect(result).toBeDefined();
                    if (result) {
                        result.update({$push: {values: {name: 'pushed'}}}, function (err, result) {
                            expect(err).toBeNull();
                            expect(result).toBe(1);
                            if (result) {
                                AccountModel.findOne({email: 'pushed@pushed.com'}, function (err, pushed) {
                                    expect(err).toBeNull();
                                    if (pushed) {
                                        expect(pushed.values.length).toBe(4);
                                        expect(pushed.values[3]).toEqual({name: 'pushed'});
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
                    expect(err).toBeNull();
                    expect(result).toBeDefined();
                    if (result) {
                        result.update({$push: {values: {$each: [
                            {name: 'pushed'},
                            {name: 'pushed2'}
                        ]}}}, function (err, result) {
                            expect(err).toBeNull();
                            expect(result).toBe(1);
                            if (result) {
                                AccountModel.findOne({email: 'pushed@pushed.com'}, function (err, pushed) {
                                    expect(err).toBeNull();
                                    if (pushed) {
                                        expect(pushed.values.length).toBe(5);
                                        expect(pushed.values[4]).toEqual({name: 'pushed2'});
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
                    expect(err).toBeNull();
                    expect(result).toBeDefined();
                    if (result) {
                        AccountModel.update({}, {$push: {values: 'pushed'}}, {multi: 0, sort:{email:1}}, function (err, result) {
                            expect(err).toBeNull();
                            expect(result).toBe(1);
                            if (result) {
                                AccountModel.find({values: {$in: ['pushed']}}, function (err, pushed) {
                                    expect(err).toBeNull();
                                    if (pushed) {
                                        expect(pushed.length).toBe(1);
                                        expect(pushed[0].values).toContain('pushed');
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
                    expect(err).toBeNull();
                    expect(result).toBeDefined();
                    if (result) {
                        AccountModel.update({}, {$push: {values: 'pushed'}}, {multi: 1}, function (err, result) {
                            expect(err).toBeNull();
                            expect(result).toBe(3);
                            if (result) {
                                AccountModel.find({values: {$in: ['pushed']}}, function (err, pushed) {
                                    expect(err).toBeNull();
                                    if (pushed) {
                                        expect(pushed.length).toBe(3);
                                        if (pushed.length === 3) {
                                            expect(pushed[2].values).toContain('pushed');
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
                expect(err).toBeFalsy();
                expect(result).toBeTruthy();
                if (result) {
                    expect(result.name).toBe('upsert');
                    SimpleModel.findOne({name: 'upsert'}, function (err, result) {
                        expect(err).toBeFalsy();
                        expect(result).toBeTruthy();
                        if (result) {
                            expect(result.name).toBe('upsert');
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
                expect(err).toBeFalsy();
                expect(result).toBeNull();
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
                    expect(data._doc['access_token.expiration']).toBe(undefined);
                    expect(data.access_token.expiration).toBe(null);
                    done();
                });
            });

        });

        describe('#35 update array item', function () {
            var bugSchema = new mongoose.Schema(
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
            var ContractModel = mongoose.model('Bug35', bugSchema);

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
                    expect(err).toBeFalsy();
                    expect(result).toBeDefined();
                    expect(result.titles.id(1).runs).toEqual(11); //all good here.
                    done();
                });
            });

            it('should not be stored in weird string property outside of titles', function (done) {
                contract.titles[0].runs = 11;
                contract.save(function (err, result) {
                    expect(err).toBeFalsy();
                    expect(result).toBeDefined();
                    expect(result.titles.id(1).runs).toEqual(11); //all good here.
                    ContractModel.find({}, function (err, results) {
                        var result = results[0];
                        expect(result._doc['titles.0.runs']).toEqual(undefined);
                        expect(result.titles.id(1).runs).toEqual(11);
                        done();
                    });
                });
            });

            it('should update nested array', function (done) {
                var flight = {start:new Date(), ends: new Date(), _id:5};
                contract.titles[0].flights.push(flight);
                contract.save(function (err, result) {
                    expect(err).toBeFalsy();
                    expect(result).toBeDefined();
                    expect(result.titles.id(1).flights[0]._id).toEqual(flight._id); //all good here.
                    ContractModel.find({}, function (err, results) {
                        var result = results[0];
                        expect(result._doc['titles.0.flights']).toEqual(undefined);
                        expect(result.titles.id(1).flights[0]._id).toEqual(flight._id);
                        done();
                    });
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
                    expect(model.name).toBe('updateName');
                    expect(model.age).toBe(35);
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
                    expect(model.name).toBe('name1');
                    expect(model.title).toBe('unique');

                    Model.findOneAndUpdate({name:'name2'}, {title:'unique'}, {upsert:true}, function (err, model) {
                        expect(err).toBeDefined();
                        expect(model).toBeUndefined();
                        done();
                    });
                });
            });
        });

    });
});
