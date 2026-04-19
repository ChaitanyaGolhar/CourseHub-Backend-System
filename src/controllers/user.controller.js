const { findUserById } = require("../repositories/user.repo");

async function getProfile(req, res) {
    const user = await findUserById(req.user.id);

    if (!user) {
      throw new Error("user not found", 404);
    }

    return res.json({ 
      success: true,
      data: { user }
    });
}

module.exports = { getProfile };