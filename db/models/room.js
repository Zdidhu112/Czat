const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
   name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 50
   },
   type: {
      type: String,
      enum: ['public', 'private'],
      default: 'public'
   },
   theme: {
      type: Number,
      default: 1
   },
   owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   members: [{
      user: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
      },
      role: {
         type: String,
         enum: ["owner", "admin", "member"],
         default: "member"
      }
   }],
   createdAt: {
      type: Date,
      default: Date.now
   }
})

module.exports = mongoose.model('Room', roomSchema);