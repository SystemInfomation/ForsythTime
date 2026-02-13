const crypto = require("crypto");

const ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateRoomId(length = 8) {
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += ALPHANUMERIC[bytes[i] % ALPHANUMERIC.length];
  }
  return result;
}

function generateShortId(length = 12) {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

module.exports = { generateRoomId, generateShortId };
