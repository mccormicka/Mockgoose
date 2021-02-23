var mongoose = require('mongoose');
let {Mockgoose} = require('./built/mockgoose');
const {MongoDBDownload} = require('mongodb-download');

let mockgoose = new Mockgoose(mongoose);
mockgoose.helper.setDbVersion("3.2.1");

mockgoose.prepareStorage().then(() => {
	console.log('prepare storage ok', mongoose.mocked);
	mongoose.connect('mongodb://sdfsdfsdf:27017');
	
	mongoose.connection.on('connected', function () {  
	  console.log('Mongoose open');
	}); 
});
//var Mockgoose = require('./Mockgoose')(mongoose).then(function() {
	

//});
