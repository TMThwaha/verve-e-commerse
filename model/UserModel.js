const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    confirmPassword: {
        type: String,
        require: true
    },
    status: {
        type: Boolean,
        default: true
    }
})

const userModel = new mongoose.model('userModel',userSchema)

module.exports = userModel