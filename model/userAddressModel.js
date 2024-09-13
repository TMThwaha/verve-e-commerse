const mongoose = require('mongoose');
const UserDb = require('../model/UserModel')

const addressSchema = new mongoose.Schema({

    name:{
        required: true,
        type: String
    },
    number:{
        required: true,
        type: Number
    },
    pincode:{
        required: true,
        type: Number
    },
    locality:{
        required: true,
        type: String
    },
    address:{
        required:true,
        type: String
    },
    city:{
        required:true,
        type: String
    },
    state:{
        required:true,
        type: String
    },

})

const userAddressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: UserDb, 
        required: true,
    },
    addresses: [addressSchema]
});

const Address = mongoose.model('Address',userAddressSchema);

module.exports = Address;