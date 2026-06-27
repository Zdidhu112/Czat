const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
 text: {
      type: String,
      trim: true,
      required: true
   },
date: {
      type: Date,
      default: Date.now
   },
post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
   }
 })

module.exports = mongoose.model('Room', roomSchema);