const mongoose = require("mongoose");
const logger = require("../utils/logger");

async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/videocall";
  try {
    await mongoose.connect(uri);
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error("MongoDB connection error", { error: err.message });
    process.exit(1);
  }
}

module.exports = connectDB;
