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

var UserDefinition = {
    name: { type: String },
    username: { type: String },
    password: { type: String },
    email: { type: String },
    role: {
        type: String,
        'default': 'staff'
    },
    updated: {
        type: Date,
        'default': Date.now
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompanyEntry'
    },
    otpw: {
        type: String,
        'default': uuid.v4()
    }
};

var UserSchema = new mongoose.Schema(
    UserDefinition, schemaOptions
);
UserSchema.path('username').index({ unique: true });
UserSchema.path('email').index({ unique: true });

UserSchema.index({
    username: 1
});

module.exports = mongoose.model('UserEntry', UserSchema);
	