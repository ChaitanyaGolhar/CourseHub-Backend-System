const { findUserById } = require("../repositories/user.repo");
const { getUserCoursesService } = require("../services/user.service");
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

async function getMyCourses(req, res) {
  const courses = await getUserCoursesService(req.user.id);

  return res.json({
    success: true,
    data: { courses }
  });
}

module.exports = { getProfile, getMyCourses };