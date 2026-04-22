const { findUserById } = require("../repositories/user.repo");
const AppError = require("../utils/AppError");

async function getProfile(req, res) {
    const user = await findUserById(req.user.id);

    if (!user) {
      throw new AppError("user not found", 404);
    }

    return res.json({ 
      success: true,
      data: { user }
    });
}

module.exports = { getProfile };