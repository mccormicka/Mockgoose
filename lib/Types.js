var path = require('path');

var mongoose;
try {
    if (process.env.PWD.indexOf('node_modules') !== -1) {
        mongoose = require(path.join(process.env.PWD, '..', 'mongoose'));
    }
} catch (e) {
    console.warn('Using bundled mongoose version for ObjectId class: ' + require('mongoose/package.json').version);
} finally {
    mongoose = mongoose || require('mongoose');
}

module.exports = mongoose.Types;
