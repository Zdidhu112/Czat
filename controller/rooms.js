const Room = require("../db/models/room");
const Message = require("../db/models/message");

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
const deleteRoom = async (roomId, userId) =>{
  try {
    const room = await Room.findById(roomId);
    // console.log(room);
    if(!room) return null;
    if(!room.owner.equals(userId)) {
      throw new Error("Brak uprawnień");
    }
    await Room.findOneAndDelete({_id: roomId});
    await Message.deleteMany({room: roomId});

    return room;
  } catch (error) {
    console.log(error);
  }
}
const updateSettings = async (roomId, userId, data) => {
    try {
    const room = await Room.findById(roomId);
    if(!room) return null;

    const isOwner = room.owner.equals(userId);
    const isAdmin = room.members.some(member =>{
      return member.user.equals(userId) && member.role === "admin"
    })
    if(!isOwner && !isAdmin) {
      throw new Error("Brak uprawnień");
    }
    for(let el in data) {
      if(el != "name" && el != "theme") return null;
    }
    Object.assign(room, data);
    await room.save();
    return room;
  } catch (error) {
    console.log(error);
    return null;
  }
}
module.exports = {
  createRoom,
  getUserRooms,
  getRoomById,
  deleteRoom,
  updateSettings
}