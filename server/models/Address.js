const mongoose = require('mongoose');

const singleAddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
  pincode: { type: Number, required: true },
  locality: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  addressType: {
    type: String,
    enum: ['HOME', 'WORK', 'OTHER'],
    default: 'HOME'
  }
});

const userAddressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  addresses: [singleAddressSchema]
}, {
  timestamps: true
});

const Address = mongoose.model('Address', userAddressSchema);

module.exports = Address;
