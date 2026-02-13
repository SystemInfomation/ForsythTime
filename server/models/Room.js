const mongoose = require("mongoose");
const { generateShortId } = require("../utils/generateId");

const chatMessageSchema = new mongoose.Schema(
  {
    messageId: { type: String, default: () => generateShortId() },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    username: { type: String, required: true },
    message: { type: String, required: true, maxlength: 1000 },
    timestamp: { type: Date, default: Date.now },
    reactions: {
      type: Map,
      of: [{ type: mongoose.Schema.Types.ObjectId }],
      default: {},
    },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    minlength: 8,
    maxlength: 8,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 50,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  passwordHash: {
    type: String,
  },
  waitingRoomEnabled: {
    type: Boolean,
    default: false,
  },
  waitingRoom: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  chatMessages: [chatMessageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// roomId unique index is created by `unique: true` in the schema
roomSchema.index({ creator: 1 });

module.exports = mongoose.model("Room", roomSchema);
