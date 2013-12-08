var mongoose = require('mongoose'),
    uuid = require('node-uuid');

var schemaOptions = {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
};
/*jshint -W106 */
var CompanyDefinition = {
    name: { type: String },
    contact: {
        email: { type: String },
        address: { type: String }
    },
    users: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'UserEntry' }
    ],
    updated: {
        type: Date,
        'default': Date.now
    },
    created: {
        type: Date,
        'default': Date.now
    },
    access_key: {
        type: String,
        'default': uuid.v4()
    }
};

var CompanySchema = new mongoose.Schema(
    CompanyDefinition, schemaOptions
);
CompanySchema.index({ name: 1, updated: 1 });

module.exports = mongoose.model('CompanyEntry', CompanySchema);
