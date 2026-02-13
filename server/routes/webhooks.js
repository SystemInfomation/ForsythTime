const express = require("express");
const { Webhook } = require("svix");
const User = require("../models/User");
const logger = require("../utils/logger");

const router = express.Router();

// POST /api/webhooks/clerk
// Clerk sends user.created, user.updated, user.deleted events
router.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!CLERK_WEBHOOK_SECRET) {
      logger.error("CLERK_WEBHOOK_SECRET not configured");
      return res.status(500).json({ error: "Webhook secret not configured" });
    }

    // Verify the webhook signature using svix
    const svixId = req.headers["svix-id"];
    const svixTimestamp = req.headers["svix-timestamp"];
    const svixSignature = req.headers["svix-signature"];

    if (!svixId || !svixTimestamp || !svixSignature) {
      return res.status(400).json({ error: "Missing svix headers" });
    }

    let evt;
    try {
      const wh = new Webhook(CLERK_WEBHOOK_SECRET);
      const body = typeof req.body === "string" ? req.body : req.body.toString();
      evt = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch (err) {
      logger.warn("Clerk webhook verification failed", { error: err.message });
      return res.status(400).json({ error: "Invalid webhook signature" });
    }

    const eventType = evt.type;
    const data = evt.data;

    try {
      if (eventType === "user.created") {
        const email =
          data.email_addresses &&
          data.email_addresses.length > 0
            ? data.email_addresses[0].email_address
            : null;

        const username =
          data.username ||
          (data.first_name
            ? `${data.first_name}${data.last_name || ""}`.replace(/\s+/g, "").slice(0, 20)
            : `user_${data.id.slice(-8)}`);

        if (!email) {
          logger.warn("Clerk user.created: no email found", { clerkId: data.id });
          return res.status(200).json({ received: true });
        }

        const existing = await User.findOne({ clerkId: data.id });
        if (!existing) {
          await User.create({
            clerkId: data.id,
            email,
            username: username.slice(0, 20),
          });
          logger.info("User synced from Clerk (created)", { clerkId: data.id, email });
        }
      } else if (eventType === "user.updated") {
        const email =
          data.email_addresses &&
          data.email_addresses.length > 0
            ? data.email_addresses[0].email_address
            : undefined;

        const username =
          data.username ||
          (data.first_name
            ? `${data.first_name}${data.last_name || ""}`.replace(/\s+/g, "").slice(0, 20)
            : undefined);

        const updateFields = {};
        if (email) updateFields.email = email;
        if (username) updateFields.username = username.slice(0, 20);

        if (Object.keys(updateFields).length > 0) {
          await User.findOneAndUpdate({ clerkId: data.id }, updateFields);
          logger.info("User synced from Clerk (updated)", { clerkId: data.id });
        }
      } else if (eventType === "user.deleted") {
        await User.findOneAndDelete({ clerkId: data.id });
        logger.info("User synced from Clerk (deleted)", { clerkId: data.id });
      }
    } catch (err) {
      logger.error("Clerk webhook processing error", {
        error: err.message,
        eventType,
      });
      return res.status(500).json({ error: "Webhook processing error" });
    }

    res.status(200).json({ received: true });
  }
);

module.exports = router;
