const { findUserById } = require("../repositories/user.repo");

async function getProfile(req, res) {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    return res.json({ user });
  } catch {
    return res.status(500).json({ message: "internal server error" });
  }
}

module.exports = { getProfile };