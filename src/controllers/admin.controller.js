const { findCourseById, createCourse, publishCourse, unpublishCourse, getMaxSectionOrder, createSection, findSectionById, getMaxLectureOrder, createLecture } = require("../repositories/course.repo");
const AppError = require("../utils/AppError");
const { th } = require("zod/locales");

async function createCourseHandler(req, res) {
  const { title, price, description, thumbnail_url } = req.validateData.body;

  const course = await createCourse(title, price, description, thumbnail_url, req.user.id);

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

async function createSectionHandler(req, res) {
  const { title, courseId } = req.validateData.body;

  const course = await findCourseById(courseId);

  if(!course){
    throw new AppError("course not found", 400)
  }

  if(course.creator_id !== req.user.id){
    throw new AppError("forbidden", 403)
  }

  const maxOrder = await getMaxSectionOrder(courseId);
  const newOrder = maxOrder + 1;

  const section = await createSection(title, courseId, newOrder);
  return res.status(201).json({
    success: true,
    message: "section created successfully",
    data: section
  })
}

async function createLectureHandler(req, res){
  const { title, videoUrl, sectionId, isPreview = false } = req.validateData.body;
  const section = await findSectionById(sectionId);

  if(!section){
    throw new AppError("section now found", 400)
  }

  const course = await findCourseById(section.course_id)
  if(!course){
    throw new AppError("course not found", 400)
  }

  if(course.creator_id !== req.user.id){
    throw new AppError("forbidden", 403)
  }

  const maxOrder = await getMaxLectureOrder(sectionId);
  const newOrder = maxOrder + 1;

  const lecture = await createLecture(title, videoUrl, sectionId, newOrder, isPreview);

  return res.status(201).json({
    success: true,
    message: "lecture created successfully",
    data: lecture
  })
}

module.exports = {
  createCourseHandler,
  publish,
  unpublish,
  createSectionHandler,
  createLectureHandler
};