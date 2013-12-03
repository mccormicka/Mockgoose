describe('Mockgoose Populate Tests', function () {
    'use strict';

    var mockgoose = require('../Mockgoose');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB');
    var ParentModel = require('./models/ParentModel')(mongoose);
    var SimpleModel = require('./models/SimpleModel')(mongoose);
    var ObjectId = require('mongodb').BSONPure.ObjectID;

    var accountId;
    beforeEach(function (done) {
        mockgoose.reset();
        SimpleModel.create(
        	{name: 'Child 1', value: 'one'},
            {name: 'child 2', value: 'two'},
            function (err, one, two) {
        		ParentModel.create(
            		{name: 'Parent 1'},
            		{name: 'Parent 2', childs: [ one._id, two._id]},
	            	function (err, p1, p2) {
	            		console.log(p2);
	            		
    	            	expect(err).toBeFalsy();
        				done();  
                	}
        		);
            });
    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('Populate', function () {
        it('should find the childs within the parent', function (done) {
            ParentModel.findOne({name:'Parent 2'}, function(err,doc) {
				expect(err).toBeFalsy();
			}).populate('childs').exec(function(err, result){
				console.log("=");
				console.log(result);
				
				expect(err).toBeFalsy();
				expect(result.childs.length).toBe(2);
			});
        });

       
    });
});