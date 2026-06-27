const Message = require('./../db/models/message');

 getMessages = async (room) => {
    return await Message
        .find({ room })
        .sort({ createdAt: 1 })
        .limit(50);
};
module.exports = {getMessages}