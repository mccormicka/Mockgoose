// Whether to use old or new Mongoose
//var old = false;

//var mongoose = require(old ? 'mockgoose/node_modules/mongoose' : 'mongoose');
var mongoose = require('mongoose');
var Mockgoose = require('./Mockgoose');

Mockgoose(mongoose, {}, function(err) {
    mongoose.connect('mongodb://localhost:27017/whatever', function(err) {
        console.log('connected');
        // start your test
    });
});


