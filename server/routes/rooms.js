const express = require("express");
const bcrypt = require("bcryptjs");
const Room = require("../models/Room");
const { authRequired } = require("../middleware/auth");
const { createRoomValidation } = require("../middleware/validate");
const { generateRoomId } = require("../utils/generateId");
const logger = require("../utils/logger");

const router = express.Router();

// POST /api/rooms/create
router.post("/create", authRequired, createRoomValidation, async (req, res) => {
  try {
    const { name, isPrivate, password, waitingRoomEnabled } = req.body;

    // Generate a unique roomId
    let roomId;
    let attempts = 0;
    do {
      roomId = generateRoomId();
      attempts++;
      if (attempts > 10) {
        return res.status(500).json({ error: "Failed to generate unique room ID" });
      }
    } while (await Room.findOne({ roomId }));

    const roomData = {
      roomId,
      name,
      creator: req.user._id,
      isPrivate: !!isPrivate,
      waitingRoomEnabled: !!waitingRoomEnabled,
    };

    if (isPrivate && password) {
      roomData.passwordHash = await bcrypt.hash(password, 10);
    }

    const room = await Room.create(roomData);
    logger.info("Room created", { roomId, creator: req.user._id });
    res.status(201).json({ room });
  } catch (err) {
    logger.error("Create room error", { error: err.message });
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/rooms/my
router.get("/my", authRequired, async (req, res) => {
  try {
    const rooms = await Room.find({ creator: req.user._id })
      .select("-chatMessages -passwordHash")
      .sort({ createdAt: -1 });
    res.json({ rooms });
  } catch (err) {
    logger.error("Get my rooms error", { error: err.message });
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/rooms/public
router.get("/public", authRequired, async (req, res) => {
  try {
    const rooms = await Room.find({ isPrivate: false })
      .select("roomId name creator createdAt waitingRoomEnabled")
      .populate("creator", "username")
      .sort({ createdAt: -1 });
    res.json({ rooms });
  } catch (err) {
    logger.error("Get public rooms error", { error: err.message });
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/rooms/:roomId
router.get("/:roomId", authRequired, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId })
      .populate("creator", "username")
      .populate("waitingRoom", "username");

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Return paginated chat messages
    const skip = parseInt(req.query.skip, 10) || 0;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);

    const roomObj = room.toObject();
    const totalMessages = roomObj.chatMessages.length;
    roomObj.chatMessages = roomObj.chatMessages
      .slice(Math.max(0, totalMessages - skip - limit), totalMessages - skip)
      .reverse();
    delete roomObj.passwordHash;

    res.json({ room: roomObj, totalMessages });
  } catch (err) {
    logger.error("Get room error", { error: err.message });
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/rooms/join/:roomId
router.post("/join/:roomId", authRequired, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Check private room password
    if (room.isPrivate && room.passwordHash) {
      const { password } = req.body;
      if (!password) {
        return res.status(403).json({ error: "Password required for private room" });
      }
      const valid = await bcrypt.compare(password, room.passwordHash);
      if (!valid) {
        return res.status(403).json({ error: "Incorrect room password" });
      }
    }

    // Handle waiting room
    if (room.waitingRoomEnabled) {
      // Creator doesn't need to wait
      if (!room.creator.equals(req.user._id)) {
        const alreadyWaiting = room.waitingRoom.some((id) => id.equals(req.user._id));
        if (!alreadyWaiting) {
          room.waitingRoom.push(req.user._id);
          await room.save();
        }
        return res.json({ status: "waiting", message: "Waiting for host approval" });
      }
    }

    res.json({ status: "joined", roomId: room.roomId });
  } catch (err) {
    logger.error("Join room error", { error: err.message });
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
