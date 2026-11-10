const mongoose = require('../config/db');

const userSchema = mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    lastSeen: {
        type: Date,
        default: null
    },
    profileImage:{
        type: String,
        default: null
    }
}, {
    timestamps: true
})
module.exports = mongoose.model('user', userSchema);