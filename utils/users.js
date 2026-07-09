const users = [];

function userJoin(id, username, room, userId) {
    const user = {id, username, room, userId};

    users.push(user);

    return user;
}

function getCurrentUser(id) {
    return users.find(user => user.id === id);
}
function getCurrentUserByReq(userId) {
    return users.filter(user => user.userId === userId);
}
function userLeave(id) {
    const index = users.findIndex(user => user.id === id);

    if(index !== -1) {
        return users.splice(index, 1)[0];
    }
}

function getRoomUsers(room) {
    const roomUsers = users.filter(user => user.room == room);
    
    const uniqueUsers = [];
    const seenUsers = new Set();

    for (const user of roomUsers) {
        // Rzutujemy na String, na wypadek gdyby userId było obiektem z MongoDB (ObjectId)
        const stringId = user.userId.toString(); 
        if (!seenUsers.has(stringId)) {
            seenUsers.add(stringId);
            uniqueUsers.push(user);
        }
    }

    return uniqueUsers;
}
module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    getCurrentUserByReq
}