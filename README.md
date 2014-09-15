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
    var mockgoose = require('mockgoose');

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
* [$nor](http://docs.mongodb.org/manual/reference/operator/query/nor/),
* [$not](http://docs.mongodb.org/manual/reference/operator/query/not/),
* [$or](http://docs.mongodb.org/manual/reference/operator/query/or/),
* [$pull](http://docs.mongodb.org/manual/reference/operator/update/pull/),
* [$pullAll](http://docs.mongodb.org/manual/reference/operator/update/pullAll/),
* [$push](http://docs.mongodb.org/manual/reference/operator/update/push/),
* [$pushAll](http://docs.mongodb.org/manual/reference/operator/update/pushAll/),
* [$regex](http://docs.mongodb.org/manual/reference/operator/query/regex/),
* [$set](http://docs.mongodb.org/manual/reference/operator/update/set/),
* [$setOnInsert](http://docs.mongodb.org/manual/reference/operator/update/setOnInsert/),
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
    
    mockgoose.reset('schema name')*

to delete all the associated models for a schema.
*schema names are case sensitive
