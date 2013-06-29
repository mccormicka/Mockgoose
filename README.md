##What is Mockgoose?

Mockgoose is a simplified in memory database that allows you to perform actions on Mongoose Models without having a running instance of MongoDB. 

The main purpose of Mockgoose as you may have guessed from the name is to allow you to mock out your mongoose database during testing so that you do not have to spin up a new database for every test and teardown that same database afterwards.

##Install
To install the latest official version, use NPM:

    npm install mockgoose --save-dev

To run the tests and see what is supported by Mockgoose navigate to the Mockgoose folder and run the test suite

    npm test

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

Simple find operations. (multiple and nested finds not currently supported)
    
    find();
    findOne();
    findById();
    findOneAndUpdate();
    Update();

##Operators

$in 
$pull   
$push 
$each

##Options
multi 0/1 defaults to 0 
upsert true/false defaults to false

##Validators
Mockgoose includes support for validators and the unique field key.

Mockgoose comes with a reset() method that allows you to reset the Mockgoose database
simply call 

    mockgoose.reset() 

to delete all the collections and models in the database
or call 
    
    mockgoose.reset('schema name') 

to delete all the associated models for a schema.


CHANGELOG

#0.0.2 

Added support for $in operator for finds

#0.0.6
Added support for $pull operator
Added support for update();
Added support for findOneAndUpdate()

#0.0.7
Added support for $pull of multiple items at once.
{$pull:{values:{name:{$in:['one', 'two']}}}}

#0.0.8 
Fixed findOneAndUpdate() so that it saves the object after updating if no error is thrown

#0.0.9
Fixed boolean comparisons

#0.0.10
Removed findAll() and made find() and findOne() work with empty objects {} to keep inline with Mongoose API.

#0.0.11 
Added support for findAndUpdate() {upsert:true} option.

#0.0.12
Fixed Update() method so that it works correctly with static and model updates.

#0.0.13
Added support for $push with $each and {multi:0/1}


