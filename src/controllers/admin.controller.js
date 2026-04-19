const { findCourseById, createCourse, publishCourse, unpublishCourse } = require("../repositories/course.repo");

async function createCourseHandler(req, res) {
  const { title, price } = req.validateData.body;

  const course = await createCourse(title, price, req.user.id);

  return res.status(201).json({ course });
}

async function publish(req, res) {
  const course = await findCourseById(req.validateData.params.id);

  if (!course) return res.status(404).json({ message: "not found" });

  if (course.creator_id !== req.user.id) {
    return res.status(403).json({ message: "forbidden" });
  }

  await publishCourse(course.id);

  return res.json({ message: "published" });
}

async function unpublish(req, res) {
  const course = await findCourseById(req.validateData.params.id);

  if (!course) return res.status(404).json({ message: "not found" });

  if (course.creator_id !== req.user.id) {
    return res.status(403).json({ message: "forbidden" });
  }

  await unpublishCourse(course.id);

  return res.json({ message: "unpublished" });
}

module.exports = {
  createCourseHandler,
  publish,
  unpublish
};