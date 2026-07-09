const moment = require('moment');

const Message = require('./../db/models/message');

const getMessages = async (room, before = null, limit = 10) => {
    try {
        const query = { room };

        if (before) {
            query.createdAt = { $lt: before };
        }

        const messages = await Message.find(query)
             .sort({ createdAt: -1 })
           .limit(limit);

        return messages;

    } catch (err) {
        console.log(err);
    }
};
const createMessage = async (user, username, room, text) => {
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
const replyMessage = async (roomId, messageId, user, username) => {
    try {
        let originalMsg = await Message.findById(messageId);
        if (!originalMsg) throw new Error("Nie znalezionoo powielanej wiadomości")
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
const toggleLike = async (messageId, userId) =>{
    try {
        const message = await Message.findById(messageId);

        if(!message) return null;

        const index = message.likes.findIndex(el => {
            return el.equals(userId);
        })
        if(index === -1) {
            message.likes.push(userId);
        } else {
            message.likes.splice(index, 1)
        }
        await message.save();
        return message;
    } catch (error) {
        console.log(error);        
    }
}
module.exports = { getMessages, createMessage, replyMessage, toggleLike }