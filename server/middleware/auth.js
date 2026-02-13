const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logger");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable must be set");
}

function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
}

async function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    logger.warn("Invalid token", { error: err.message });
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { authRequired, generateToken, JWT_SECRET };
