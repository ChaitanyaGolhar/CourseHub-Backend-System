const { findCourseById, createCourse, publishCourse, unpublishCourse, getMaxSectionOrder, createSection, findSectionById, getMaxLectureOrder, createLecture, updateCourseThumbnail, findLectureById, updateLectureVideo, findLectureInSectionById } = require("../repositories/course.repo");
const AppError = require("../utils/AppError");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

async function createCourseHandler(req, res) {
  const { title, price, description } = req.validatedData.body;

  let thumbnailUrl = null;

  if(req.file){
    const result = await uploadToCloudinary(req.file.buffer, "thumbnails", "image");
    thumbnailUrl = result.secure_url;
  }
  const course = await createCourse(title, price, description, thumbnailUrl, req.user.creatorId);

  return res.status(201).json({
     success: true,
     message: "course created",
     data: course
  });
}

async function publish(req, res) {
  const course = await findCourseById(req.validatedData.params.id);

  if (!course) {
    throw new AppError("not found", 404);
  }

  if (course.creatorId !== req.user.creatorId) {
    throw new AppError("forbidden", 403);
  }

  await publishCourse(course.id);

  return res.json({ 
    success: true, 
    message: "published"
  });
}

async function unpublish(req, res) {
  const course = await findCourseById(req.validatedData.params.id);

  if (!course) {
    throw new AppError("not found", 404);
  }

  if (course.creatorId !== req.user.creatorId) {
    throw new AppError("forbidden", 403);
  }

  await unpublishCourse(course.id);

  return res.json({ 
    success: true, 
    message: "unpublished" 
  });
}

async function createSectionHandler(req, res) {
  const { title, courseId } = req.validatedData.body;

  const course = await findCourseById(courseId);

  if(!course){
    throw new AppError("course not found", 400)
  }

  if(course.creatorId !== req.user.creatorId){
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
  const { title, videoUrl, sectionId, isPreview = false } = req.validatedData.body;
  const section = await findSectionById(sectionId);

  if(!section){
    throw new AppError("section now found", 400)
  }

  const course = await findCourseById(section.course_id)
  if(!course){
    throw new AppError("course not found", 400)
  }

  if(course.creatorId !== req.user.creatorId){
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

async function uploadThumbnail(req, res) {
  const courseId = req.validatedData.params.courseId;

  if (!req.file) {
    throw new AppError("file required", 400);
  }

  const course = await findCourseById(courseId);
  if (!course) {
    throw new AppError("course not found", 404);
  }

  if (course.creatorId !== req.user.creatorId) {
    throw new AppError("forbidden", 403);
  } 

const result = await uploadToCloudinary(req.file.buffer, "thumbnails", "image");
const updatedCourse = await updateCourseThumbnail(courseId, result.secure_url);

  return res.json({
    success: true,
    data: {
      courseId: courseId,
      url: result.secure_url
    }
  });
}

async function uploadLectureVideo(req, res) {
  const lectureId = req.validatedData.params.lectureId;
  const sectionId = req.validatedData.params.sectionId;

  if (!req.file) {
    throw new AppError("file required", 400);
  }

  const lecture = await findLectureInSectionById(lectureId, sectionId);
  
  if (!lecture) {
    throw new AppError("lecture not found", 404);
  }

  const section = await findSectionById(sectionId);
  const course = await findCourseById(section.course_id);
  if (!course) {
    throw new AppError("course not found", 404);
  }

  if (course.creatorId !== req.user.creatorId) {
    throw new AppError("forbidden", 403);
  } 

  const result = await uploadToCloudinary(req.file.buffer, "Videos", "video");
  const updatedLecture = await updateLectureVideo(lecture.order_index, lecture.section_id, result.secure_url);

  return res.json({
    success: true,
    data: {
      lectureId: lectureId,
      url: result.secure_url
    }
  });
}

module.exports = {
  createCourseHandler,
  publish,
  unpublish,
  createSectionHandler,
  createLectureHandler,
  uploadThumbnail,
  uploadLectureVideo
};