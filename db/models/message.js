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
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        index: true,
        required: true
    },

    text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    // shared: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Message",
    //     default: null
    // },
    time: {
        type: String,
        required: true
    }

}, {
    timestamps: true
});


module.exports = mongoose.model('Message', commentSchema);