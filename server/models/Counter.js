const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  model: {
    type: String,
    required: true,
    unique: true
  },
  field: String,
  count: {
    type: Number,
    default: 1000,
    required: true
  }
});

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
