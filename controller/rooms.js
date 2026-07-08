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
    }).sort({ updatedAt: -1 });
  } catch (error) {
    console.log(error);
  }
}
const getRoomById = async (id) => {
  try {
    return await Room.findById(id).populate("members.user", "name");
  } catch (error) {
    console.log(error);
  }
}
const deleteRoom = async (roomId, userId) => {
  try {
    const room = await Room.findById(roomId);
    // console.log(room);
    if (!room) return null;
    if (!room.owner.equals(userId)) {
      throw new Error("Brak uprawnień");
    }
    await Room.findOneAndDelete({ _id: roomId });
    await Message.deleteMany({ room: roomId });

    return room;
  } catch (error) {
    console.log(error);
  }
}
const updateSettings = async (roomId, userId, data) => {
  try {
    const room = await Room.findById(roomId);
    if (!room) return null;

    const isOwner = room.owner.equals(userId);
    const isAdmin = room.members.some(member => {
      return member.user.equals(userId) && member.role === "admin"
    })
    if (!isOwner && !isAdmin) {
      throw new Error("Brak uprawnień");
    }
    for (let el in data) {
      if (el != "name" && el != "theme") return null;
    }
    Object.assign(room, data);
    await room.save();
    return room;
  } catch (error) {
    console.log(error);
    return null;
  }
}
const updateLast = async (roomId, text) => {
  try {
    const room = await Room.findByIdAndUpdate(roomId, { lastMessage: text, updatedAt: Date.now() }, {returnDocument: 'after'});

    return room;
  } catch (error) {
    console.log(error);
  }
}
const removeMember = async (roomId, userId, memberId) => {
  try {
    const room = await Room.findById(roomId);
    if (!room) return null;

    const user = room.members.find(el => {
      return el.user.equals(userId)
    })
    if (!user) return;

    const member = room.members.find(el => {
      return el.user.equals(memberId);
    })
    if (!member) return null;
    if (room.owner.equals(memberId)) return null;

    if (user.role === "owner") {
      room.members = room.members.filter(el => {
        return !el.user.equals(memberId)
      })
    } else if (user.role === "admin") {
      if (member.role === "admin") return null;
      room.members = room.members.filter(el => {
        return !el.user.equals(memberId)
      })
    } else {
      return null;
    }

    await room.save();
    const updated = await Room.findById(roomId)
            .populate("members.user", "name");
    return updated.members;
  } catch (error) {
    console.log(error);
  }
}
const promoteMember = async (roomId, userId, memberId) => {
  try {
    const room = await Room.findById(roomId);
    if (!room) return null;

    const user = room.members.find(el => {
      return el.user.equals(userId)
    })
    if (!user) return;
    if (user.role != "admin" && !room.owner.equals(userId)) return null;
    const member = room.members.find(el => {
      return el.user.equals(memberId);
    })
    if (!member) return null;
    if (room.owner.equals(memberId)) return null;
    if (member.role === "admin") return null;

    room.members = room.members.map(el => {
      if (el.user.equals(memberId)) {
        el.role = "admin";
      }
      return el;
    });

    await room.save();
    const updated = await Room.findById(roomId)
            .populate("members.user", "name");
    return updated.members;
  } catch (error) {
    console.log(error);
  }
}
const addMembers = async (roomId, userId, members) => {
  try {
    const room = await Room.findById(roomId);
    if (!room) return null;

    const user = room.members.find(el => {
      return el.user.equals(userId)
    })
    if (!user) return;
    if (user.role != "admin" && !room.owner.equals(userId)) return null;

    members.forEach(id => {

      const exists = room.members.some(
        m => m.user.equals(id)
      );

      if (!exists) {
        room.members.push({
          user: id,
          role: "member"
        });
      }

    });
    await room.save();
   const updated = await Room.findById(roomId)
            .populate("members.user", "name");
    return updated;
  } catch (error) {
    console.log(error);
  }
}
module.exports = {
  createRoom,
  getUserRooms,
  getRoomById,
  deleteRoom,
  updateSettings,
  updateLast,
  removeMember,
  promoteMember,
  addMembers
}