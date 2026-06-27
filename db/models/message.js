const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
 user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
username: {
        type: String,
        required: true
    },

    room: {
        type: String,
        required: true
    },

    text: {
        type: String,
        required: true,
        trim: true
    },
    time: {
      type: String,
      required: true
    }

});


module.exports = mongoose.model('Message', commentSchema);