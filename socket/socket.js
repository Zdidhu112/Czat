const formatMessage = require("../utils/messages");
const {isValidId} = require("../utils/id-valid");
const Message = require("./../db/models/message");
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
} = require("../utils/users");
const { getMessages, createMessage } = require("./../controller/messages");
const { getRoomById} = require("./../controller/rooms");

const botName = "Bocik";

module.exports = function (io) {
    io.on("connection", (socket) => {

        const socketUser = socket.request.user;
        const userId = socket.request.user._id;
        const username = socketUser.name;
        socket.on("joinRoom", async (roomId) => {
            if(!isValidId(roomId)) return;
            const user = userJoin(socket.id, username, roomId);
            const room = await getRoomById(roomId);

            if (!room)
                return;

            if (room.type === "private") {

                const allowed = room.members.some(
                    member => member.user.equals(socket.request.user._id)
                );

                if (!allowed)
                    return;

            }

            socket.join(user.room);
            const messages = await getMessages(user.room);
            socket.emit("id", userId);
            socket.emit("chatHistory", messages);

            socket.emit(
                "message",
                formatMessage(botName, "Hejka!", 0)
            );

            io.to(user.room).emit("roomUsers", {
                room: room._id,
                name: room.name,
                users: getRoomUsers(user.room),
            });

            socket.broadcast
                .to(user.room)
                .emit(
                    "message",
                    formatMessage(botName, `${user.username} joined`, 0)
                );
        });

        socket.on("chatMessage", async (msg) => {
            const user = getCurrentUser(socket.id);
            if(!user) return;
            await createMessage(userId, user.username, user.room, msg);
            io.to(user.room).emit(
                "message",
                formatMessage(user.username, msg, userId)
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