##What is Mockgoose?

Mockgoose is a simplified in memory database that allows you to perform actions on Mongoose Models without having a running instance of MongoDB. 

The main purpose of Mockgoose as you may have guessed from the name is to allow you to mock out your mongoose database during testing so that you do not have to spin up a new database for every test and teardown that same database afterwards.

##Usage
You simply require Mongoose and Mockgoose and wrap Mongoose with Mockgoose.

    var mongoose = require('mongoose');
    var mockgoose = require('Mockgoose');

    mockgoose(mongoose);

Once Mongoose has been wrapped by Mockgoose all calls to connect() and createConnection() will be intercepted by Mockgoose so that no MongoDB instance is created.

Currently supported model operations are.

    save();
    create();
    remove();
//Simple find operations. (multiple and nested finds not currently supported)
    find();
    findOne();
    findById();

Mockgoose comes with a reset() method that allows you to reset the Mockgoose database
simply call mockgoose.reset() to delete all the collections and models in the database
or call mockgoose.reset('schema name') to delete all the associated models for a schema.

Update() is not currently supported.

###TODO before releasing as npm
* Setup test harness.

