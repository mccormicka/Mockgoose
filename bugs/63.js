'use strict';
var mongoose = require('mongoose');
require('../mockgoose')(mongoose);

mongoose.connect('mongodb://127.0.0.1:27017/test', function(err){
    if(err) return console.log(err);
    console.log('connected. should disconnect in 1s.');
});

setTimeout(function(){
    mongoose.disconnect(function(err){
        if(err) return console.log(err);
        console.log('disconnected');
    });
}, 2000);
