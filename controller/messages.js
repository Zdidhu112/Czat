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
            room: [room],
            text,
            time: moment().format("h:mm a")
        });
        await message.save();
        return message;

    } catch (error) {
        console.log(error);
    }
}
addRoom = async (roomId, messageId) => {
    try {
        const msg = await Message.findOne({ _id: messageId });
        if (!msg) return null;
        if (!msg.room.includes(roomId)) {
            msg.room.push(roomId);
        }
        await msg.save();
        return msg;
    } catch (error) {
        console.log(error);
    }
}

module.exports = { getMessages, createMessage, addRoom }