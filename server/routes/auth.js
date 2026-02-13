const express = require("express");
const User = require("../models/User");
const { authRequired, generateToken } = require("../middleware/auth");
const { registerValidation, loginValidation } = require("../middleware/validate");
const logger = require("../utils/logger");

const router = express.Router();

// POST /api/auth/register
router.post("/register", registerValidation, async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });
    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? "email" : "username";
      return res.status(409).json({ error: `${field} already in use` });
    }

    const user = await User.create({ email, username, password });
    const token = generateToken(user._id);

    logger.info("User registered", { userId: user._id, username });
    res.status(201).json({ token, user });
  } catch (err) {
    logger.error("Register error", { error: err.message });
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", loginValidation, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    logger.info("User logged in", { userId: user._id });
    res.json({ token, user });
  } catch (err) {
    logger.error("Login error", { error: err.message });
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/auth/me
router.get("/me", authRequired, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
