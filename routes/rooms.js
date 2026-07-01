const express = require("express");
const path = require("path");
const router = express.Router();
const User = require('./../db/models/users');
const {createRoom, getUserRooms} = require("../controller/rooms");
const {checkAuthenticated, checkNotAuthenticated} = require("../utils/auth-check");

router.get("/api", checkAuthenticated, async (req, res)=>{
        const rooms = await getUserRooms(req.user._id);
        res.json(rooms);
})
router.get("/api/users", checkAuthenticated, async (req, res)=>{
         const users = await User.find(
        { _id: { $ne: req.user._id } },
        "name email"
    );

    res.json(users);
})
router.post("/api", checkAuthenticated, async (req, res)=>{
    const room = await createRoom({
        name: req.body.name,
        type: req.body.type,
        owner: req.user._id,
        members: req.body.members
    })
    console.log(room);
    
    res.status(201).json(room);
})

module.exports = router;