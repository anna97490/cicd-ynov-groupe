const mongoose = require('mongoose');
const { Schema } = mongoose;

const blogPostSchema = new Schema({
  title: String,
  content: String, 
  author: String,
  date: Date
});

module.exports = mongoose.model('BlogPost', blogPostSchema);
