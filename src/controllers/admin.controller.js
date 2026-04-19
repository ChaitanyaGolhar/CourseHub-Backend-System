const { success } = require("zod");
const { findCourseById, createCourse, publishCourse, unpublishCourse } = require("../repositories/course.repo");
const AppError = require("../utils/AppError");
const { th } = require("zod/locales");

async function createCourseHandler(req, res) {
  const { title, price } = req.validateData.body;

  const course = await createCourse(title, price, req.user.id);

  return res.status(201).json({
     success: true,
     message: "course created",
     data: course
  });
}

async function publish(req, res) {
  const course = await findCourseById(req.validateData.params.id);

  if (!course) {
    throw new AppError("not found", 404);
  }

  if (course.creator_id !== req.user.id) {
    throw new AppError("forbidden", 403);
  }

  await publishCourse(course.id);

  return res.json({ 
    success: true, 
    message: "published"
  });
}

async function unpublish(req, res) {
  const course = await findCourseById(req.validateData.params.id);

  if (!course) {
    throw new AppError("not found", 404);
  }

  if (course.creator_id !== req.user.id) {
    throw new AppError("forbidden", 403);
  }

  await unpublishCourse(course.id);

  return res.json({ 
    success: true, 
    message: "unpublished" 
  });
}

module.exports = {
  createCourseHandler,
  publish,
  unpublish
};