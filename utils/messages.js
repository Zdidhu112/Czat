const moment = require('moment');

function formatMessage(username, text, user, _id) {
    return {
        username,
        text,
        user,
        _id,
        time: moment().format("h:mm a"),
    }
}
function emitToUser(io, userId, event, data) {
    io.sockets.sockets.forEach(socket => {
        if (socket.request.user._id.toString() === userId.toString()) {
            socket.emit(event, data);
        }
    });
}
module.exports = {formatMessage, emitToUser}