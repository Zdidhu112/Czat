const moment = require('moment');

const Message = require('./../db/models/message');

getMessages = async (room) => {
    try {
        return await Message
            .find({ room })
            .sort({ createdAt: 1 })
            .limit(50);
    } catch (err) {
        console.log(err)
    }
};
createMessage = async (user, username, room, text) => {
    try {
        const message = new Message({
            user,
            username,
            room,
            text,
            time: moment().format("h:mm a")
        });
        await message.save();

    } catch (error) {
        console.log(error);
    }
}

module.exports = { getMessages, createMessage }