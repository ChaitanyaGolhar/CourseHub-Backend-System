const { createCreatorService, getPublicCreatorCoursesService, createCourseService, getCreatorCoursesService, updateCourseService, createSectionService, createLectureService, updateLectureVideoService, updateCourseThumbnailService, publishCourseService, unpublishCourseService } = require("../services/creator.service");

async function createCreatorHandler(req, res) {
  const { handle, brandName } = req.validatedData.body;

  const creator = await createCreatorService({
    userId: req.user.id,
    handle,
    brandName
  });

  return res.status(201).json({
    success: true,
    message: "creator created",
    data: creator
  });
}

async function getPublicCreatorCoursesHandler(req, res) {
  const { handle } = req.params;

  const data = await getPublicCreatorCoursesService(handle);

  return res.json({
    success: true,
    data
  });
}

async function createCourseHandler(req, res) {
  const course = await createCourseService({
    body: req.validatedData.body,
    file: req.file,
    creatorId: req.user.creatorId
  });

  res.status(201).json({
    success: true,
    data: course
  });
}

async function getCoursePublicHandler(req, res) {
  const courses = await getCreatorCoursesService(req.user.creatorId);

  return res.json({
    success: true,
    data: courses
  });
}

async function updateCourseHandler(req, res) {
  const courseId = req.params.courseId;

  const updated = await updateCourseService({
    courseId,
    creatorId: req.user.creatorId,
    data: req.validatedData.body
  });

  return res.json({
    success: true,
    data: updated
  });
}

async function createSectionHandler(req, res) {
  const { title } = req.validatedData.body;
  const courseId = req.params.courseId;

  const section = await createSectionService({
    title,
    courseId,
    creatorId: req.user.creatorId
  });

  return res.status(201).json({
    success: true,
    data: section
  });
}

async function createLectureHandler(req, res) {
  const { title, sectionId, isPreview } = req.validatedData.body;

  const lecture = await createLectureService({
    title,
    sectionId,
    isPreview,
    creatorId: req.user.creatorId
  });

  return res.status(201).json({
    success: true,
    data: lecture
  });
}

async function updateLectureVideoHandler(req, res) {
  const { lectureId } = req.params;

  const updated = await updateLectureVideoService({
    lectureId,
    creatorId: req.user.creatorId,
    file: req.file
  });

  return res.json({
    success: true,
    data: updated
  });
}

async function updateCourseThumbnailHandler(req, res) {
  const { courseId } = req.params;

  const updated = await updateCourseThumbnailService({
    courseId,
    creatorId: req.user.creatorId,
    file: req.file
  });

  return res.json({
    success: true,
    data: updated
  });
}

async function publishCourseHandler(req, res) {
  const course = await publishCourseService(
    req.params.courseId,
    req.user.creatorId
  );

  return res.json({
    success: true,
    data: course
  });
}

async function unpublishCourseHandler(req, res) {
  const course = await unpublishCourseService(
    req.params.courseId,
    req.user.creatorId
  );

  return res.json({
    success: true,
    data: course
  });
}

module.exports = {
  createCreatorHandler,
  getPublicCreatorCoursesHandler,
  createCourseHandler,
  getCoursePublicHandler,
  updateCourseHandler,
  createSectionHandler,
  createLectureHandler,
  updateLectureVideoHandler,
  updateCourseThumbnailHandler,
  publishCourseHandler,
  unpublishCourseHandler
  
};