describe('Mockgoose Find Tests', function () {
    'use strict';

    var mockgoose = require('../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB');
    var AccountModel = require('./models/AccountModel')(mongoose);
    var SimpleModel = require('./models/SimpleModel')(mongoose);
    var IndexModel = require('./models/IndexModel')(mongoose);
    var ObjectId = require('mongodb').BSONPure.ObjectID;

    beforeEach(function (done) {
        mockgoose.reset();
        AccountModel.create(
            {email: 'valid@valid.com', password: 'password'},
            {email: 'invalid@invalid.com', password: 'password'},
            function (err, valid, invalid) {
                expect(err).toBeFalsy();
                expect(valid).toBeTruthy();
                expect(invalid).toBeTruthy();
                SimpleModel.create(
                    {name: 'one', value: 'one'},
                    {name: 'one', value: 'two'},
                    {name: 'one', value: 'two'},
                    {name: 'two', value: 'one'},
                    {name: 'two', value: 'two'},
                    function (err, one, two, three, four, five) {
                        expect(err).toBeFalsy();
                        expect(one).toBeTruthy();
                        expect(two).toBeTruthy();
                        expect(three).toBeTruthy();
                        expect(four).toBeTruthy();
                        expect(five).toBeTruthy();
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

    describe('Find', function () {

        it('should be able to find an item by id', function (done) {
            AccountModel.create({email: 'one@one.com', password: 'password'},
                {email: 'two@two.com', password: 'password'}, function (err, one, two) {
                    expect(err).toBeFalsy();
                    expect(two).toBeDefined();
                    if (two) {
                        AccountModel.findById(two._id, function (err, model) {
                            expect(err).toBeFalsy();
                            if (model) {
                                expect(model._id.toString()).toBe(two._id.toString());
                                done(err);
                            } else {
                                done('Unable to find model by ID');
                            }
                        });
                    } else {
                        done('Error creating items' + err + one + two);
                    }
                });
        });

        it('should find all models if an empty {} object is passed to find', function (done) {
            SimpleModel.find({}, function (err, result) {
                expect(err).toBeFalsy();
                expect(result).toBeTruthy();
                if (result) {
                    expect(result.length).toBe(5);
                }
                done();
            });
        });

        it('should find all models if no {} object is passed to find', function (done) {
            SimpleModel.find(function (err, result) {
                expect(err).toBeFalsy();
                expect(result).toBeTruthy();
                if (result) {
                    expect(result.length).toBe(5);
                }
                done();
            });
        });

        it('Be able to pass a fields object and still have the callback fired', function (done) {
            SimpleModel.find({}, {}, function (err, result) {
                expect(err).toBeFalsy();
                expect(result).toBeTruthy();
                if (result) {
                    expect(result.length).toBe(5);
                }
                done();
            });
        });

        it('Be able to pass a options object and still have the callback fired', function (done) {
            SimpleModel.find({}, {}, {}, function (err, result) {
                expect(err).toBeFalsy();
                expect(result).toBeTruthy();
                if (result) {
                    expect(result.length).toBe(5);
                }
                done();
            });
        });

        it('should be able to find multiple model by using a simple query', function (done) {
            SimpleModel.find({name: 'one'}, function (err, models) {
                expect(err).toBeFalsy();
                expect(models.length).toBe(3);
                done(err);
            });
        });

        it('should be able to find multiple model by using a slightly complex query', function (done) {
            SimpleModel.find({name: 'one', value: 'two'}, function (err, models) {
                expect(err).toBeFalsy();
                expect(models.length).toBe(2);
                done(err);
            });
        });

        it('should be able to find all models of a certain type', function (done) {
            SimpleModel.find({}, function (err, models) {
                expect(err).toBeFalsy();
                expect(models.length).toBe(5);
                done(err);
            });
        });

        it('Be able to find an object by int value', function (done) {

            var schema = new mongoose.Schema({
                name: String,
                value: Number
            });

            var Model = mongoose.connection.model('Numbers', schema);
            Model.create({name: 'one', value: 1}, {name: 'two', value: 2}, function () {
                Model.find({value: 2}, function (err, results) {
                    expect(err).toBeNull();
                    expect(results).toBeDefined();
                    if (results) {
                        expect(results.length).toBe(1);
                        if (results.length === 1) {
                            expect(results[0].name).toBe('two');
                        }
                        done(err);
                    } else {
                        done('Error finding result by Number value');
                    }
                });
            });
        });

        it('Be able to pass a fields include object to find', function (done) {
            SimpleModel.create({name: 'fields', value: 'one', type: 'blue', bool: 1}, function (err, result) {
                SimpleModel.find({name: 'fields'}, {value: 1, type: 1, _id: 1}, function (err, models) {
                    expect(err).toBeFalsy();
                    expect(models.length).toBe(1);
                    if (models[0]) {
                        var model = models[0];
                        expect(model.name).toBeUndefined();
                        expect(model.bool).toBeUndefined();
                        expect(model.value).toBe('one');
                        expect(model.type).toBe('blue');
                        //Make sure our mask does not remove methods.
                        expect(typeof model.save === 'function').toBe(true);
                        //Make sure it also does not convert object types.
                        expect(model._id).toEqual(result._id);
                        done(err);
                    } else {
                        done('Error finding model' + err + models);
                    }
                });
            });
        });

        it('Be able to pass a fields exclude object to find', function (done) {
            SimpleModel.create({name: 'fields', value: 'one', type: 'blue', bool: 1}, function (err, result) {
                SimpleModel.find({name: 'fields'}, {name: 0, bool: 0}, function (err, models) {
                    expect(err).toBeFalsy();
                    expect(models.length).toBe(1);
                    if (models[0]) {
                        var model = models[0];
                        expect(model.name).toBeUndefined();
                        expect(model.bool).toBeUndefined();
                        expect(model.value).toBe('one');
                        expect(model.type).toBe('blue');
                        //Make sure our mask does not remove methods.
                        expect(typeof model.save === 'function').toBe(true);
                        //Make sure it also does not convert object types.
                        expect(model._id).toEqual(result._id);
                        done(err);
                    } else {
                        done('Error finding model' + err + models);
                    }
                });
            });
        });

        it('Be able to pass a fields include string to find', function (done) {
            SimpleModel.create({name: 'fields', value: 'one', type: 'blue', bool: 1}, function () {
                SimpleModel.find({type: 'blue'}, 'value type', function (err, models) {
                    expect(err).toBeFalsy();
                    expect(models.length).toBe(1);
                    if (models) {
                        var model = models[0];
                        expect(model.name).toBeUndefined();
                        expect(model.value).toBe('one');
                        expect(model.type).toBe('blue');
                        done(err);
                    } else {
                        done('Error finding model' + err + models);
                    }
                });
            });
        });

        it('Be able to pass a fields exclude string to find', function (done) {
            SimpleModel.create({name: 'fields', value: 'one', type: 'blue', bool: 1}, function () {
                SimpleModel.find({type: 'blue'}, '-name -bool', function (err, models) {
                    expect(err).toBeFalsy();
                    expect(models.length).toBe(1);
                    if (models) {
                        var model = models[0];
                        expect(model.name).toBeUndefined();
                        expect(model.value).toBe('one');
                        expect(model.type).toBe('blue');
                        done(err);
                    } else {
                        done('Error finding model' + err + models);
                    }
                });
            });
        });

        it('Should throw an error if you pass a mixed include/exclude object', function (done) {
            SimpleModel.create({name: 'fields', value: 'one', type: 'blue', bool: 1}, function () {
                SimpleModel.findOne({type: 'blue'}, {value: 1, type: 0}, function (err, model) {
                    expect(err).toBeDefined();
                    if(err){
                        expect(err.name).toBe('MongoError');
                        expect(err.message).toBe('You cannot currently mix including and excluding fields. Contact us if this is an issue.');
                    }
                    expect(model).toBeUndefined();
                    done();
                });
            });
        });

        it('Should throw an error if you pass a mixed include/exclude string', function (done) {
            SimpleModel.create({name: 'fields', value: 'one', type: 'blue', bool: 1}, function () {
                SimpleModel.findOne({type: 'blue'}, '-name value type -bool', function (err, model) {
                    expect(err).toBeDefined();
                    if(err){
                        expect(err.name).toBe('MongoError');
                        expect(err.message).toBe('You cannot currently mix including and excluding fields. Contact us if this is an issue.');
                    }
                    expect(model).toBeUndefined();
                    done();
                });
            });
        });

    });

    describe('findOne', function () {

        it('should be able to findOne model by using a simple query', function (done) {
            AccountModel.findOne({email: 'valid@valid.com'}, function (err, model) {
                expect(err).toBeFalsy();
                expect(model.email).toBe('valid@valid.com');
                done(err);
            });
        });

        it('should be able to findOne model by using a slightly complex query', function (done) {
            SimpleModel.findOne({name: 'one', value: 'two'}, function (err, model) {
                expect(err).toBeFalsy();
                if (model) {
                    expect(model.name).toBe('one');
                    expect(model.value).toBe('two');
                    done(err);
                } else {
                    done('Error finding model' + err + model);
                }
            });
        });

        it('Be able to pass a fields object to findOne', function (done) {
            SimpleModel.create({name: 'fields', value: 'one', type: 'blue', bool: 1}, function () {
                SimpleModel.findOne({type: 'blue'}, {value: 1, type: 1}, function (err, model) {
                    expect(err).toBeFalsy();
                    if (model) {
                        expect(model.name).toBeUndefined();
                        expect(model.value).toBe('one');
                        expect(model.type).toBe('blue');
                        done(err);
                    } else {
                        done('Error finding model' + err + model);
                    }
                });
            });

        });

        it('Be able to pass a fields includes string to findOne', function (done) {
            SimpleModel.create({name: 'fields', value: 'one', type: 'blue', bool: 1}, function () {
                SimpleModel.findOne({type: 'blue'}, 'value type', function (err, model) {
                    expect(err).toBeFalsy();
                    if (model) {
                        expect(model.name).toBeUndefined();
                        expect(model.value).toBe('one');
                        expect(model.type).toBe('blue');
                        done(err);
                    } else {
                        done('Error finding model' + err + model);
                    }
                });
            });
        });

        it('should match boolean values', function (done) {
            SimpleModel.create(
                {name: 'true', password: 'something', bool: true},
                {name: 'false', password: 'something', bool: false}, function () {

                    SimpleModel.findOne({bool: true}, function (err, result) {
                        if (result) {
                            expect(result.name).toBe('true');
                            SimpleModel.findOne({bool: false}, function (err, result) {
                                if (result) {
                                    expect(result.name).toBe('false');
                                    done(err);
                                } else {
                                    done('Unable to find' + err + result);
                                }
                            });
                        } else {
                            done('Unable to find' + err + result);
                        }

                    });
                });
        });

        it('should find a models if an empty {} object is passed to findOne', function (done) {
            SimpleModel.findOne({}, function (err, result) {
                expect(err).toBeFalsy();
                expect(result).toBeTruthy();
                if (result) {
                    expect(result.type).toBe('simple');
                }
                done();
            });
        });
    });

    describe('findOneAndUpdate', function () {

        it('should be able to findOneAndUpdate models', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: ['one', 'two']},
                function () {
                    AccountModel.findOneAndUpdate({email: 'multiples@valid.com'}, {email: 'updatedemail@email.com'}, function (err, result) {
                        expect(result).toBeDefined();
                        if (result) {
                            expect(result.email).toBe('updatedemail@email.com');
                            done(err);
                        } else {
                            done('Error finding models');
                        }
                    });
                });
        });

        it('should be able to findOneAndUpdate models and saved model changed', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: ['one', 'two']},
                function () {
                    AccountModel.findOneAndUpdate({email: 'multiples@valid.com'}, {email: 'updatedemails@email.com'}, function (err, result) {
                        expect(result).toBeDefined();
                        if (result) {
                            expect(result.email).toBe('updatedemails@email.com');
                        }
                        AccountModel.findOne({email: 'updatedemails@email.com'}, function (err, found) {
                            expect(found).toBeDefined();
                            done(err);
                        });
                    });
                });
        });

        it('should be able to findOneAndUpdate multiple values in models', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: ['one', 'two']},
                function () {
                    AccountModel.findOneAndUpdate({email: 'multiples@valid.com'},
                        {email: 'updatedemail@email.com', values: ['updated']}, function (err, result) {
                            expect(result).toBeDefined();
                            if (result) {
                                expect(result.email).toBe('updatedemail@email.com');
                                expect(result.values[0]).toEqual('updated');
                                done(err);
                            } else {
                                done('Error finding models');
                            }
                        });
                });
        });

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
    });

    describe('findByIdAndUpdate', function () {

        it('should be able to findByIdAndUpdate models', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: ['one', 'two']},
                function (err, result) {
                    var id = result._id;
                    AccountModel.findByIdAndUpdate(id, {email: 'updatedemail@email.com'}, function (err, result) {
                        expect(result).toBeDefined();
                        if (result) {
                            expect(result.email).toBe('updatedemail@email.com');
                            done(err);
                        } else {
                            done('Error finding models');
                        }
                    });
                });
        });

        it('should be able to findOneAndUpdate models and saved model changed', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: ['one', 'two']},
                function (err, result) {
                    var id = result._id;
                    AccountModel.findByIdAndUpdate(id, {email: 'updatedemails@email.com'}, function (err, result) {
                        expect(result).toBeDefined();
                        if (result) {
                            expect(result.email).toBe('updatedemails@email.com');
                        }
                        AccountModel.findOne({email: 'updatedemails@email.com'}, function (err, found) {
                            expect(found).toBeDefined();
                            done(err);
                        });
                    });
                });
        });

        it('should be able to findByIdAndUpdate multiple values in models', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: ['one', 'two']},
                function (err, result) {
                    var id = result._id;
                    AccountModel.findByIdAndUpdate(id,
                        {email: 'updatedemail@email.com', values: ['updated']}, function (err, result) {
                            expect(result).toBeDefined();
                            if (result) {
                                expect(result.email).toBe('updatedemail@email.com');
                                expect(result.values[0]).toEqual('updated');
                                done(err);
                            } else {
                                done('Error finding models');
                            }
                        });
                });
        });

        it('should be able to findByIdAndUpdate with an upsert', function (done) {
            SimpleModel.findByIdAndUpdate('525ae43faa26361773000008', {name: 'upsert'}, {upsert: true}, function (err, result) {
                expect(err).toBeFalsy();
                expect(result).toBeTruthy();
                if (result) {
                    expect(result.name).toBe('upsert');
                    expect(result._id).toBeDefined();
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
    });

    describe('$in', function () {

        it('should be able to find a model $in', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: ['one', 'two']},
                {email: 'multiples@invalid.com', password: 'password', values: ['two', 'three']},
                function () {
                    AccountModel.findOne({values: {$in: ['three']}}, function (err, result) {
                        expect(result).toBeDefined();
                        if (result) {
                            expect(result.values[1]).toBe('three');
                            done(err);
                        } else {
                            done('Error finding model');
                        }
                    });
                });
        });

        it('should be able to find models $in with more than one value', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: ['one', 'two']},
                {email: 'multiples@invalid.com', password: 'password', values: ['two', 'three']},
                function () {
                    AccountModel.find({values: {$in: ['two']}}, function (err, result) {
                        expect(result).toBeDefined();
                        if (result) {
                            expect(result.length).toBe(2);
                            done(err);
                        } else {
                            done('Error finding models');
                        }
                    });
                });
        });

        it('should be able to find models $in with multiple values', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: ['one', 'two']},
                {email: 'multiples@invalid.com', password: 'password', values: ['two', 'three']},
                function () {
                    AccountModel.find({values: {$in: ['two', 'three']}}, function (err, result) {
                        expect(result).toBeDefined();
                        if (result) {
                            expect(result.length).toBe(2);
                            done(err);
                        } else {
                            done('Error finding models');
                        }
                    });
                });
        });
    });

    describe('findByIdAndRemove', function () {

        it('Be able to remove an item by its id', function (done) {
            SimpleModel.create(
                {name: 'one', value: 'one'}, function (err, result) {
                    SimpleModel.findByIdAndRemove(result._id, function (err, removed) {
                        expect(err).toBeNull();
                        if (removed) {
                            expect(removed._id.toString()).toEqual(result._id.toString());
                            SimpleModel.findOne({id: result._id}, function (err, item) {
                                expect(item).toBeNull();
                                done(err);
                            });
                        }
                        else {
                            done('Error removing item!');
                        }
                    });
                });
        });

        it('Not return an item if no item found to remove', function (done) {
            SimpleModel.findByIdAndRemove(new ObjectId(), function (err, removed) {
                expect(err).toBeNull();
                expect(removed).toBeNull();
                done(err);
            });
        });
    });

    describe('findOneAndRemove', function () {

        it('Be able to remove an item by its field', function (done) {
            SimpleModel.create(
                {name: 'unique', value: 'one'}, function (err, result) {
                    SimpleModel.findOneAndRemove({name: 'unique'}, function (err, removed) {
                        expect(err).toBeNull();
                        if (removed) {
                            expect(removed._id.toString()).toEqual(result._id.toString());
                            SimpleModel.findOne({id: result._id}, function (err, item) {
                                expect(item).toBeNull();
                                done(err);
                            });
                        }
                        else {
                            done('Error removing item!');
                        }
                    });
                });
        });

        it('Not return an item if no item found to remove', function (done) {
            SimpleModel.findOneAndRemove({name: Math.random()}, function (err, removed) {
                expect(err).toBeNull();
                expect(removed).toBeNull();
                done(err);
            });
        });

        it('Be able to sort items by field in ascending order Numeric', function (done) {
            IndexModel.create({name: 'zzz', value: 1}, {name: 'aaa', value: 2}, function (err, results) {
                expect(err).toBeNull();
                expect(results).toBeDefined();
                if (results) {
                    IndexModel.findOne({}, {}, {sort: {value: 1}}, function (err, model) {
                        expect(err).toBeNull();
                        expect(model).toBeDefined();
                        if (model) {
                            expect(model.name).toBe('zzz');
                            expect(model.value).toBe(1);
                            done(err);
                        } else {
                            done('Error finding models');
                        }
                    });
                } else {
                    done('Error creating Models!');
                }
            });
        });

        it('Be able to sort items by field in descending order Numeric', function (done) {
            IndexModel.create({name: 'zzz', value: 1}, {name: 'aaa', value: 2}, function (err, results) {
                expect(err).toBeNull();
                expect(results).toBeDefined();
                if (results) {
                    IndexModel.findOne({}, {}, {sort: {value: -1}}, function (err, model) {
                        expect(err).toBeNull();
                        expect(model).toBeDefined();
                        if (model) {
                            expect(model.name).toBe('aaa');
                            expect(model.value).toBe(2);
                            done(err);
                        } else {
                            done('Error finding models');
                        }
                    });
                } else {
                    done('Error creating Models!');
                }

            });
        });

        it('Be able to sort items by field in ascending order Alpha', function (done) {
            IndexModel.create({name: 'zzz', value: 1}, {name: 'aaa', value: 2}, function (err, results) {
                expect(err).toBeNull();
                expect(results).toBeDefined();
                if (results) {
                    IndexModel.findOne({}, {}, {sort: {name: 1}}, function (err, model) {
                        expect(err).toBeNull();
                        expect(model).toBeDefined();
                        if (model) {
                            expect(model.name).toBe('aaa');
                            expect(model.value).toBe(2);
                            done(err);
                        } else {
                            done('Error finding models');
                        }
                    });
                } else {
                    done('Error creating Models!');
                }
            });
        });

        it('Be able to sort items by field in descending order Alpha', function (done) {
            IndexModel.create({name: 'zzz', value: 1}, {name: 'aaa', value: 2}, function (err, results) {
                expect(err).toBeNull();
                expect(results).toBeDefined();
                if (results) {
                    IndexModel.findOne({}, {}, {sort: {name: -1}}, function (err, model) {
                        expect(err).toBeNull();
                        expect(model).toBeDefined();
                        if (model) {
                            expect(model.name).toBe('zzz');
                            expect(model.value).toBe(1);
                            done(err);
                        } else {
                            done('Error finding models');
                        }
                    });
                } else {
                    done('Error creating Models!');
                }
            });
        });

        /**
         * http://mongoosejs.com/docs/api.html#model_Model.find
         * Returns: <Query>
         */
        it('should return a mongoose Query object', function () {
            expect(SimpleModel.find({}) instanceof mongoose.Query).toBeTruthy();
        });

    });
});