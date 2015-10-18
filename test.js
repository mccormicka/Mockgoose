var mongoose = require('mongoose');
var Mockgoose = require('./Mockgoose')(mongoose);

mongoose.connect('mongodb://localhost:27017');

mongoose.connection.on('connected', function () {  
  console.log('Mongoose open');
}); 

Mockgoose.on('mongodbStarted', function(db_opts) {
	console.log('db_opts', db_opts);
});