const mongoose = require('mongoose');
const path = require('path');
const mockgoose = require(path.join(__dirname, '../Mockgoose'));

mockgoose(mongoose);
mongoose.connect('mongodb://localhost:27017/test');

// BUG: will not show `Cannot find module 'this-module-not-found'` error
require('this-module-not-found');
