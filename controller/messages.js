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
        return message;

    } catch (error) {
        console.log(error);
    }
}
replyMessage = async (roomId, messageId, user, username) => {
    try {
        let originalMsg = await Message.findById(messageId);
        if(!originalMsg) throw new Error("Nie znalezionoo powielanej wiadomości")
        const message = new Message({
            user,
            username: username + " przesłał  wiadomość",
            room: roomId,
            text: originalMsg.text,
            reply: messageId,
            time: moment().format("h:mm a")
        });
        await message.save();
        return message;
    } catch (error) {
        console.log(error);
    }
}

module.exports = { getMessages, createMessage, replyMessage }