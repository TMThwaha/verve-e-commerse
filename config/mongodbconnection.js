


require('dotenv').config();
const mongoose = require('mongoose');
const mongoURI = process.env.MONGOURI;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

  module.exports = mongoose