[![Build Status](https://travis-ci.org/mccormicka/Mockgoose.png?branch=master)](https://travis-ci.org/mccormicka/Mockgoose)

Please Share on Twitter if you like #mockgoose
<a href="https://twitter.com/intent/tweet?hashtags=mockgoose&amp;&amp;text=Check%20out%20this%20%23Mongoose%20%23MongoDB%20Mocking%20Framework&amp;tw_p=tweetbutton&amp;url=http%3A%2F%2Fbit.ly%2F19gcHwm&amp;via=omnipitence" style="float:right">
<img src="https://raw.github.com/mccormicka/Mockgoose/master/twittershare.png">
</a>

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

###Options
___mongoose___ ___required___ Instance of mongoose.

___throwError___ ___optional___ Boolean true/false to throw errors on connection defaults to false.

###Connection Events
Dispatches some but not all of the events supported by Mockgoose
http://mongoosejs.com/docs/api.html#connection_Connection

Supported Events
```
connecting
connected
open
error
```

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

* [$](http://docs.mongodb.org/manual/reference/operator/update/positional/)
* [$addToSet](http://docs.mongodb.org/manual/reference/operator/update/addToSet/),
* [$all](http://docs.mongodb.org/manual/reference/operator/query/all/),
* [$and](http://docs.mongodb.org/manual/reference/operator/query/and/),
* [$elemMatch](http://docs.mongodb.org/manual/reference/operator/projection/elemMatch/),
* [$exists](http://docs.mongodb.org/manual/reference/operator/projection/exists/),
* [$gt](http://docs.mongodb.org/manual/reference/operator/query/gt/),
* [$gte](http://docs.mongodb.org/manual/reference/operator/query/gte/),
* [$in](http://docs.mongodb.org/manual/reference/operator/query/in/),
* [$inc](http://docs.mongodb.org/manual/reference/operator/update/inc/),
* [$lt](http://docs.mongodb.org/manual/reference/operator/query/lt/),
* [$lte](http://docs.mongodb.org/manual/reference/operator/query/lte/),
* [$ne](http://docs.mongodb.org/manual/reference/operator/query/ne/),
* [$nin](http://docs.mongodb.org/manual/reference/operator/query/nin/),
* [$not](http://docs.mongodb.org/manual/reference/operator/query/not/),
* [$or](http://docs.mongodb.org/manual/reference/operator/query/or/),
* [$pull](http://docs.mongodb.org/manual/reference/operator/update/pull/),
* [$pullAll](http://docs.mongodb.org/manual/reference/operator/update/pullAll/),
* [$push](http://docs.mongodb.org/manual/reference/operator/update/push/),
* [$pushAll](http://docs.mongodb.org/manual/reference/operator/update/pushAll/),
* [$set](http://docs.mongodb.org/manual/reference/operator/update/set/),
* [$unset](http://docs.mongodb.org/manual/reference/operator/update/unset/)

##Options

* multi   : 0/1 defaults to 0
* upsert  : true/false defaults to false
* sort    : one level of sorting for find operations {sort: {name:1}}
* [skip](http://docs.mongodb.org/manual/reference/method/db.collection.find/#set-the-starting-point-of-the-result-set)
* [limit](http://docs.mongodb.org/manual/reference/method/db.collection.find/#limit-the-number-of-documents-to-return)

##Validators
Mockgoose includes support for validators and the unique field key.

Mockgoose comes with a reset() method that allows you to reset the Mockgoose database
simply call 

    mockgoose.reset() 

to delete all the collections and models in the database
or call 
    
    mockgoose.reset('schema name') 

to delete all the associated models for a schema.


####CHANGELOG

#####1.7.8
Fixed #34 support for nested value updates.

#####1.7.7
Added support for $or operator.
http://docs.mongodb.org/manual/reference/operator/query/or/

#####1.7.6
Minor update

#####1.7.5
Added support for the skip and limit options thanks to https://github.com/erickrdch
http://docs.mongodb.org/manual/reference/method/db.collection.find/#set-the-starting-point-of-the-result-set
http://docs.mongodb.org/manual/reference/method/db.collection.find/#limit-the-number-of-documents-to-return
Fixes issue #32

#####1.7.4
Added support for the $nin operator all comparison query operators now supported.
http://docs.mongodb.org/manual/reference/operator/query/nin/

#####1.7.3
Added support for the $exists operator thanks to https://github.com/mctep
http://docs.mongodb.org/manual/reference/operator/query/exists/
Fixes issue ##31

#####1.7.2
Added support for the $and operator
//http://docs.mongodb.org/manual/reference/operator/query/and/
Fixes issue #28

#####1.7.1
Added support for $lt $lte and $gte operators thanks to Chris Manson https://github.com/mansona
http://docs.mongodb.org/manual/reference/operator/query/gte/
http://docs.mongodb.org/manual/reference/operator/query/lt/
http://docs.mongodb.org/manual/reference/operator/query/lte/
Fixes issue #27

#####1.7.0
Added support for postional $ operator for $set in update methods.
http://docs.mongodb.org/manual/reference/operator/update/positional/
Fixes issue #26

#####1.6.1
Added support for nested array values #16
Updated logging levels #19
Set default log level to 'fatal' when running ```npm test```
Set default log level to 'debug' when running ```grunt```


#####1.6.0
Added support for $all operator issue #14 http://docs.mongodb.org/manual/reference/operator/query/all/
Added support for $elemMatch http://docs.mongodb.org/manual/reference/operator/projection/elemMatch/
Added support for $gt http://docs.mongodb.org/manual/reference/operator/query/gt/

#####1.5.0
Added support for $ne issue #15

#####1.4.0
Added Connection Events for issue #18 according to http://mongoosejs.com/docs/api.html#connection_Connection
Supported Events
```
connecting
connected
open
error
```
In order to dispatch error events please read dispatching Error Events above.

#####1.3.3
Merged Date sorting thanks to jiggmin https://github.com/Jiggmin

#####1.3.2
Fixed issue #13 Support for nested $in queries

#####1.3.1
Fixed issue #12 Support queries on doc arrays

#####1.3.0
Upgrade to Mongoose@3.8.2
Merge of https://github.com/mccormicka/Mockgoose/pull/11 from wavded to fix Model.count API
changes in Mongoose@3.8.2

#####1.2.2
Added more tests around Model.count to prove issue #10 is not valid

#####1.2.0
Added simple implementation of ensureIndex and getIndexes so as not to throw errors
http://docs.mongodb.org/manual/reference/method/db.collection.ensureIndex/

#####1.1.0
Added support for populate() option
http://mongoosejs.com/docs/populate.html

Thanks to [petershaw](https://github.com/petershaw)


#####1.0.6
Added bunyan logger.
You can set the log level with

    npm test | node_modules/bunyan/bin/bunyan

#####1.0.5
Added $pullAll support
http://docs.mongodb.org/manual/reference/operator/update/pullAll/

#####1.0.4
Added $pushAll support
http://docs.mongodb.org/manual/reference/operator/update/pushAll/

#####1.0.3
Added $addToSet support
http://docs.mongodb.org/manual/reference/operator/update/addToSet/

#####1.0.2
Added $inc support
http://docs.mongodb.org/manual/reference/operator/update/inc/

#####1.0.1
Added the ability to search in chains. as in

    schema({
        user:{
            profile:{
                name:'john'
            }
        }
    }

    Model.find({'user.profile.name' : 'john'}).exec();

#####1.0.0
Complete rewrite to implement a mock driver for mongodb instead of returning mock models. 

#####0.2.7
Fixed connect/createConnection issue where connect was delegating to createConnection instead of returning
the first mongoose connection.


#####0.2.6
Made model names case insensitive 'SimpleModel' and 'simplemodel' are now classed as the same model.

#####0.2.5
Added sort to find operations.
Fixed an issue with calling mongoose.model('modelName') without a schema that
was returning a real Mongoose Model it now correctly returns a Mocked Mongoose Model.
Fixed count() so that you do not need to pass a query as the first param

#####0.2.4
Aligned Mockgoose.connect() and Mockgoose.createConnection() with the Mongoose API.
You can now pass host, database, port, options, callback to the connections in the same manner as
mongoose http://mongoosejs.com/docs/api.html#connection_Connection.

The only options value that will be used is the db value all other options will be ignored.

Adresses issue 1
https://github.com/mccormicka/Mockgoose/issues/1

#####0.2.3
Added dependency on lodash

#####0.2.2
Minor update

#####0.2.1
Fixed a bug where find on number values was not working correctly.

    find({value:1}, function(err,result){});

#####0.2.0
Increment version number, fixed event emitter bug.

#####0.0.21
Added tests for findOneAndUpdate / findByIdAndUpdate

#####0.0.20
Added all find methods and aligned api's so that the fields and options.fields values work.

#####0.0.19
Large code refactor to make the project more maintainable in preparation for API alignment.

#####0.0.18
Removed connection error as we always error due to the fact Mockgoose is a mock and never really connects.

#####0.0.17
Minor bug fixes

#####0.0.16
Added the Model.count() method.
Fixed various issues with jshint
Added grunt runner so you can just call grunt and it will run jshint and the jasmine tests

#####0.0.15
Fixed NPE when passing null options to update

#####0.0.14
Removed toJSON copy inside mock model so that 3rd party libraries can manipulate mongoose json output without it affecting
mockgoose.

#####0.0.13
Added support for $push with $each and {multi:0/1}

#####0.0.12
Fixed Update() method so that it works correctly with static and model updates.

#####0.0.11
Added support for findAndUpdate() {upsert:true} option.

#####0.0.10
Removed findAll() and made find() and findOne() work with empty objects {} to keep inline with Mongoose API.

#####0.0.9
Fixed boolean comparisons

#####0.0.8
Fixed findOneAndUpdate() so that it saves the object after updating if no error is thrown

#####0.0.7
Added support for $pull of multiple items at once.
{$pull:{values:{name:{$in:['one', 'two']}}}}

#####0.0.6
Added support for $pull operator
Added support for update();
Added support for findOneAndUpdate()

#####0.0.2

Added support for $in operator for finds
