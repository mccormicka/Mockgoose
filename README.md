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
    count();
    find();
    findById();
    findByIdAndRemove();
    findByIdAndUpdate();
    findOne();
    findOneAndRemove();
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
#0.2.4
Aligned Mockgoose.connect() and Mockgoose.createConnection() with the Mongoose API.
You can now pass host, database, port, options, callback to the connections in the same manner as
mongoose http://mongoosejs.com/docs/api.html#connection_Connection.

The only options value that will be used is the db value all other options will be ignored.

Adresses issue 1
https://github.com/mccormicka/Mockgoose/issues/1


#0.2.3
Added dependency on lodash

#0.2.2
Minor update

#0.2.1
Fixed a bug where find on number values was not working correctly.

    find({value:1}, function(err,result){});

#0.2.0
Increment version number, fixed event emitter bug.

#0.0.21
Added tests for findOneAndUpdate / findByIdAndUpdate

#0.0.20
Added all find methods and aligned api's so that the fields and options.fields values work.

#0.0.19
Large code refactor to make the project more maintainable in preparation for API alignment.

#0.0.18
Removed connection error as we always error due to the fact Mockgoose is a mock and never really connects.

#0.0.17
Minor bug fixes

#0.0.16
Added the Model.count() method.
Fixed various issues with jshint
Added grunt runner so you can just call grunt and it will run jshint and the jasmine tests

#0.0.15
Fixed NPE when passing null options to update

#0.0.14
Removed toJSON copy inside mock model so that 3rd party libraries can manipulate mongoose json output without it affecting
mockgoose.

#0.0.13
Added support for $push with $each and {multi:0/1}

#0.0.12
Fixed Update() method so that it works correctly with static and model updates.

#0.0.11
Added support for findAndUpdate() {upsert:true} option.

#0.0.10
Removed findAll() and made find() and findOne() work with empty objects {} to keep inline with Mongoose API.

#0.0.9
Fixed boolean comparisons

#0.0.8
Fixed findOneAndUpdate() so that it saves the object after updating if no error is thrown

#0.0.7
Added support for $pull of multiple items at once.
{$pull:{values:{name:{$in:['one', 'two']}}}}

#0.0.6
Added support for $pull operator
Added support for update();
Added support for findOneAndUpdate()

#0.0.2 

Added support for $in operator for finds





