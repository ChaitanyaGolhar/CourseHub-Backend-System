const jwt = require("jsonwebtoken");

function tokenFor({ userId = 1, role = "user", creatorId = null } = {}, options = {}) {
  return jwt.sign({ userId, role, creatorId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
    ...options
  });
}

function bearer(payload, options) {
  return `Bearer ${tokenFor(payload, options)}`;
}

module.exports = { tokenFor, bearer };
