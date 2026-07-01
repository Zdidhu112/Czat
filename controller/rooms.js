const Room = require("../db/models/room");

const createRoom = async (data) => {
  try {
    const members = [
      {
        user: data.owner,
        role: "owner"
      }
    ]
    if (data.type === "private") {
      for (const id of data.members) {
        members.push({
          user: id,
          role: "member"
        })
      }
    }
    const room = new Room({
      name: data.name,
      type: data.type,
      owner: data.owner,
      members,
    });
    await room.save();
    console.log(room);
    return room;
  } catch (error) {
    console.log(error);
  }
}
const getUserRooms = async (userId) => {
  try {
    return await Room.find({
      $or: [
        {
          type: "public"
        },
        {
          owner: userId
        },
        {
          "members.user": userId
        }
      ]
    })
  } catch (error) {
    console.log(error);
  }
}
const getRoomById = async (id) => {
  try {
    return await Room.findById(id);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  createRoom,
  getUserRooms,
  getRoomById
}