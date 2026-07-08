function formatMessage(username, text, user, _id) {
    return {
        username,
        text,
        user,
        _id
    }
}
function emitToUser(io, userId, event, data) {
    io.sockets.sockets.forEach(socket => {
        if (socket.request.user._id.toString() === userId.toString()) {
            if(event === "removedFromRoom") socket.leave(data.id);
            socket.emit(event, data);
        }
    });
}
module.exports = {formatMessage, emitToUser}