const { formatMessage, emitToUser } = require("../utils/messages");
const { isValidId } = require("../utils/id-valid");
const Message = require("./../db/models/message");
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
} = require("../utils/users");
const { getMessages, createMessage, replyMessage, toggleLike } = require("./../controller/messages");
const { getRoomById, deleteRoom, updateSettings, updateLast, removeMember, promoteMember, addMembers } = require("./../controller/rooms");

const botName = "Bocik";

module.exports = function (io) {
    io.on("connection", (socket) => {

        const socketUser = socket.request.user;
        const userId = socket.request.user._id;
        const username = socketUser.name;
        socket.on("joinRoom", async (roomId) => {
            if (!isValidId(roomId)) return;
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
            socket.emit("roomInfo", { id: userId, roomData: room });
            socket.emit("chatHistory", messages);

            socket.emit(
                "message",
                formatMessage(botName, "Hejka!", 0, 0)
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
                    formatMessage(botName, `${user.username} joined`, 0, 0)
                );
        });

        socket.on("chatMessage", async (msg) => {
            const user = getCurrentUser(socket.id);
            if (!user) return;
            const message = await createMessage(userId, user.username, user.room, msg);
            const room = await updateLast(user.room, msg);
            if (message) {
                io.to(user.room).emit(
                    "message",
                    formatMessage(user.username, msg, userId, message._id)
                );
            }
            if (room) {
                if (room.type === "private") {
                    room.members.forEach(member => {
                        emitToUser(
                            io,
                            member.user,
                            "roomsListUpdated",
                            {
                                roomId: room._id,
                                lastMessage: msg,
                                updatedAt: room.updatedAt
                            }
                        );
                    });
                } else {
                    io.emit("roomsListUpdated", {
                        roomId: room._id,
                        lastMessage: msg,
                        updatedAt: room.updatedAt
                    })
                }
            }
        });
        socket.on("reply", async ({ msgId, roomId }) => {
            const replicatedMsg = await replyMessage(roomId, msgId, userId, username);
            if (replicatedMsg) {
                io.to(roomId).emit(
                    "message",
                    formatMessage(username, replicatedMsg.text, userId, msgId)
                );
            }
        })
        socket.on("deleteRoom", async (roomId) => {
            console.log(roomId)
            const room = await deleteRoom(roomId, userId);
            if (room) {
                io.to(roomId).emit("roomDeleted");

                io.in(roomId).socketsLeave(roomId);
            }
        })
        socket.on("changeSettings", async ({ roomId, data }) => {
            console.log(data);
            const room = await updateSettings(roomId, userId, data);
            console.log(room);

            if (room) {
                io.to(roomId).emit("roomUpdate", room);
            }
        })
        socket.on("like", async (messageId) => {
            const message = await toggleLike(messageId, userId);
            console.log(message);

            if (message) {
                io.to(message.room.toString()).emit("msgReaction", {
                    messageId,
                    likes: message.likes
                })
            }
        })
        socket.on("removeMember", async ({ roomId, memberId }) => {
            const members = await removeMember(roomId, userId, memberId);
            if (members) {
                console.log("Usunięto: ", memberId)
                io.to(roomId).emit("membersUpdated", members)
                emitToUser(
                    io,
                    memberId,
                    "removedFromRoom",
                    {
                        id: roomId
                    }
                );
            }
        })
        socket.on("promoteMember", async ({ roomId, memberId }) => {
            const members = await promoteMember(roomId, userId, memberId);
            if (members) {
                io.to(roomId).emit("membersUpdated", members)
            }
        })
        socket.on("addMembers", async ({ roomId, members }) => {
            const room = await addMembers(roomId, userId, members);
            if (room) {
                io.to(roomId).emit("membersUpdated", room.members)
                members.forEach(member => {
                    emitToUser(
                        io,
                        member,
                        "addedToRoom",
                        {
                            room
                        }
                    );

                })
            }
        })
        socket.on("disconnect", () => {
            const user = userLeave(socket.id);

            if (user) {
                io.to(user.room).emit(
                    "message",
                    formatMessage(botName, `${user.username} left`, 0, 0)
                );

                io.to(user.room).emit("roomUsers", {
                    room: user.room,
                    users: getRoomUsers(user.room),
                });
            }
        });
    });
};