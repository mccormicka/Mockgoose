describe('Mockgoose Find Tests', function () {
    'use strict';

    var mockgoose = require('../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB-58');
    var AccountModel = require('./models/AccountModel')(mongoose);
    var SimpleModel = require('./models/SimpleModel')(mongoose);
    var ObjectId = require('mongodb').BSONPure.ObjectID;

    var accountId;
    beforeEach(function (done) {
        mockgoose.reset();
        AccountModel.create(
            {email: 'valid@valid.com', password: 'password'},
            {email: 'invalid@invalid.com', password: 'password'},
            function (err, valid, invalid) {
                expect(err).toBeFalsy();
                expect(valid).toBeTruthy();
                accountId = valid._id;
                expect(invalid).toBeTruthy();
                SimpleModel.create(
                    {name: 'one', value: 'one'},
                    {name: 'one', value: 'two'},
                    {name: 'one', value: 'two'},
                    {name: 'two', value: 'one'},
                    {name: 'two', value: 'two'},
                    function (err, one, two, three) {
                        expect(err).toBeFalsy();
                        expect(one).toBeTruthy();
                        expect(two).toBeTruthy();
                        expect(three).toBeTruthy();
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
                        expect(model._id.equals(result._id)).toBe(true);
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
                        expect(model._id.equals(result._id)).toBe(true);
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
                    if (err) {
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
                    if (err) {
                        expect(err.name).toBe('MongoError');
                        expect(err.message).toBe('You cannot currently mix including and excluding fields. Contact us if this is an issue.');
                    }
                    expect(model).toBeUndefined();
                    done();
                });
            });
        });

        it('Not be able to find an object by password', function (done) {
            AccountModel.find({password: 'password'}).exec().then(function (results) {
                expect(results.length).toBe(0);
                done();
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

        describe('FindOne on nested document array', function () {

            var schema = new mongoose.Schema({ names: [] });
            var Model = mongoose.model('TestArrayQueries', schema);

            it('Perform queries on document array strings', function (done) {
                Model.create({ names: ['one', 'two'] }, function (er, test) {
                    Model.findOne({ names: 'one' }, function (err, result) {
                        expect(err).toBeNull();
                        expect(result._id.toString()).toBe(test._id.toString());
                        done(err);
                    });
                });
            });

            it('Perform queries on document array objects', function (done) {
                Model.create({ names: [
                    {name: 'one'},
                    {name: 'two'}
                ] }, function (er, test) {
                    Model.findOne({ names: {name: 'one'} }, function (err, result) {
                        expect(err).toBeNull();
                        expect(result._id.toString()).toBe(test._id.toString());
                        done(err);
                    });
                });
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

    describe('findById', function () {
        it('should be able to findById ', function (done) {
            AccountModel.findById(accountId, function (err, model) {
                expect(err).toBeFalsy();
                expect(model.email).toBe('valid@valid.com');
                done(err);
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

        it('Find nested model attribute', function (done) {
            SimpleModel.create({name: 'find nested item', profile: {'id': '12345'}}, function (err, result) {
                expect(result).toBeDefined();
                SimpleModel.findOne({'profile.id': '12345'}, function (err, result) {
                    expect(result).toBeDefined();
                    expect(result).not.toBeNull();
                    if (result) {
                        expect(result.profile.id).toBe('12345');
                    }
                    done(err);
                });
            });
        });

        it('Find deeply nested model attribute', function (done) {
            SimpleModel.create({name: 'find nested item', profile: {'stuff': {
                id: '12345'
            }}}, function (err, result) {
                expect(result).toBeDefined();
                SimpleModel.findOne({'profile.stuff.id': '12345'}, function (err, result) {
                    expect(result).toBeDefined();
                    expect(result).not.toBeNull();
                    if (result) {
                        expect(result.profile.stuff.id).toBe('12345');
                    }
                    done(err);
                });
            });
        });
    });

    describe('Bugs', function () {

        describe('#59 https://github.com/mccormicka/Mockgoose/issues/59', function () {

            var Schema = new mongoose.Schema({
                _id: Number,
                name: String,
                orders: [
                    {
                        date: Date,
                        amount: Number
                    }
                ]
            });

            var Model = mongoose.model('bug_59', Schema);

            beforeEach(function (done) {
                mockgoose.reset();
                Model.create({
                        '_id': 1,
                        'name': 'Joe Customer',
                        'orders': [
                            {
                                'date': '2014-04-01T00:00:00.000Z',
                                'amount': 100
                            },
                            {
                                'date': '2014-04-02T00:00:00.000Z',
                                'amount': 50
                            }
                        ]
                    },
                    {
                        '_id': 2,
                        'name': 'Bob Customer',
                        'orders': [
                            {
                                'date': '2014-04-10T00:00:00.000Z',
                                'amount': 75
                            },
                            {
                                'date': '2014-04-11T00:00:00.000Z',
                                'amount': 25
                            }
                        ]
                    },
                    {
                        '_id': 3,
                        'name': 'Bob Customer',
                        'orders': [
                            {
                                'date': '2014-04-06T00:00:00.000Z',
                                'amount': 100
                            }
                        ]
                    }, done);
            });

            it('Support matching of subdocuments and arrays using dot notation', function (done) {
                Model.find({ 'orders.amount': 100 }, {}).exec().then(function (models) {
                    expect(models.length).toBe(2);
                    done();
                });
            });
        });
    });
});