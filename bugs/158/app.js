var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();
console.log("is mocked:", mongoose.isMocked);
var assert = require('assert');


var mongoUrl = "mongodb://example.com:27017/foobar";
mongoose.connect(mongoUrl, function(err) { 
	console.log('inside connect');
	assert.fail(err);
});

console.log('waiting on app.js to connect');
