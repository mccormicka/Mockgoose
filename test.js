// Whether to use old or new Mongoose
//var old = false;

//var mongoose = require(old ? 'mockgoose/node_modules/mongoose' : 'mongoose');
var mongoose = require('mongoose');
require('./Mockgoose')(mongoose);

var SomeSchema = new mongoose.Schema({
        foo: String,
});

SomeSchema.statics.findAndExec = function(id) {
var model = this;
model.find({}, function(err, data) {
    console.log("data from find:", data);
        model.findByIdAndUpdate(id, {
            foo: 'blue'
        }, {
            new: true
        }, function(e, result) {
            console.log("data from findByIdAndUpdate", e, result);
            if (e) throw e;
            console.assert(result !== null, 'result shall not be null');
            console.log('Done!', result);
        }); 
});
};

var Some = mongoose.model('Some', SomeSchema);

mongoose.connect('mongodb://localhost/whatever', onConnected);

function onConnected() {
        new Some({
            foo: 'red',
        }).save(function(er, mod) {
                console.log(er, mod);
            if (er) throw er; 
            process.nextTick(function() {
                Some.findAndExec(mod.id);
            }); 
        }); 
}

