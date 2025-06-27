const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = Schema({
  name: String,
  email: String
});

module.exports = mongoose.model('User', schema);