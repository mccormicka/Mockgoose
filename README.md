[![Build Status](https://travis-ci.org/mccormicka/Mockgoose.png?branch=master)](https://travis-ci.org/mccormicka/Mockgoose)

Please Share on Twitter if you like #mockgoose
<a href="https://twitter.com/intent/tweet?hashtags=mockgoose&amp;&amp;text=Check%20out%20this%20%23Mongoose%20%23MongoDB%20Mocking%20Framework&amp;tw_p=tweetbutton&amp;url=http%3A%2F%2Fbit.ly%2F19gcHwm&amp;via=omnipitence" style="float:right">
<img src="https://raw.github.com/mccormicka/Mockgoose/master/twittershare.png">
</a>

##What is Mockgoose?

Mockgoose provides test database by spinning up mongod on the back when mockgoose.connect call is made. By default it is using in memory store which does not have persistance.

##Install
To install the latest official version, use NPM:

    npm install mockgoose --save-dev


##Usage
You simply require Mongoose and Mockgoose and wrap Mongoose with Mockgoose.

    var mongoose = require('mongoose');
    var mockgoose = require('mockgoose');

    mockgoose(mongoose);

Once Mongoose has been wrapped by Mockgoose connect() will be intercepted by Mockgoose so that no MongoDB instance is created.