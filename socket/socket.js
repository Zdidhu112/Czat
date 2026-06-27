const moment = require('moment');
const formatMessage = require("../utils/messages");
const Message = require("./../db/models/message");
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
} = require("../utils/users");
const {getMessages} = require("./../controller/messages");

const botName = "Bocik";

module.exports = function (io) {
    io.on("connection", (socket) => {

        const socketUser = socket.request.user;
        const username = socketUser.name;
        socket.on("joinRoom", async ({ room }) => {
            const user = userJoin(socket.id, username, room);

            socket.join(user.room);
            const messages = await getMessages(user.room);
            socket.emit("chatHistory", messages);

            socket.emit(
                "message",
                formatMessage(botName, "Hejka!")
            );

            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room),
            });

            socket.broadcast
                .to(user.room)
                .emit(
                    "message",
                    formatMessage(botName, `${user.username} joined`)
                );
        });

        socket.on("chatMessage", async (msg) => {
            const user = getCurrentUser(socket.id);

            const message = await Message.create({
                user: socket.request.user._id,
                username: user.username,
                room: user.room,
                text: msg,
                time: moment().format("h:mm a")                
            });
            io.to(user.room).emit(
                "message",
                formatMessage(user.username, msg)
            );
        });

        socket.on("disconnect", () => {
            const user = userLeave(socket.id);

            if (user) {
                io.to(user.room).emit(
                    "message",
                    formatMessage(botName, `${user.username} left`)
                );

                io.to(user.room).emit("roomUsers", {
                    room: user.room,
                    users: getRoomUsers(user.room),
                });
            }
        });
    });
};