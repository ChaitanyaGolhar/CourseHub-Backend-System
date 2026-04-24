const { getUserCourses } = require("../repositories/purchase.repo");

async function getUserCoursesService(userId) {
  return await getUserCourses(userId);
}


module.exports = {
  getUserCoursesService
};

