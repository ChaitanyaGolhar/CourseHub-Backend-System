const { findCreatorByUserId, findCreatorByHandle, createCreator } = require("../repositories/creator.repo");
const AppError = require("../utils/AppError");
const { createCourseRepo, getCreatorCoursesRepo, updateCourseRepo, deleteCourseRepo, createSectionRepo, createLectureRepo, updateLectureVideoRepo, updateCourseThumbnailRepo, publishCourseRepo, unpublishCourseRepo, getMaxSectionOrder, getMaxLectureOrder, getPublishedCoursesByCreatorId } = require("../repositories/course.repo");
const uploadToCloudinary  = require("../utils/uploadToCloudinary");

async function createCreatorService({ userId, handle, brandName }) {
  // 1. check user already creator
  const existing = await findCreatorByUserId(userId);

  if (existing) {
    throw new AppError("creator already exists", 400);
  }

  // 2. check handle uniqueness
  const handleExists = await findCreatorByHandle(handle);

  if (handleExists) {
    throw new AppError("handle already taken", 400);
  }

  // 3. create
  return await createCreator(userId, handle, brandName);
}

async function getPublicCreatorCoursesService(handle) {
  // 1. resolve creator
  const creator = await findCreatorByHandle(handle);

  if (!creator) {
    throw new AppError("creator not found", 404);
  }

  // 2. fetch courses
  const courses = await getPublishedCoursesByCreatorId(creator.id);

  return {
    creator: {
      id: creator.id,
      handle: creator.handle,
      brandName: creator.brand_name
    },
    courses
  };
}

async function createCourseService({ body, file, creatorId }) {
  let thumbnailUrl = null;

  if (file) {
    const result = await uploadToCloudinary(file.buffer, "thumbnails", "image");
    thumbnailUrl = result.secure_url;
  }

  return await createCourseRepo({
    ...body,
    thumbnailUrl,
    creatorId
  });
}

async function uploadLectureVideoService({ lectureId, creatorId, file }) {
  if (!file) {
    throw new AppError("file required", 400);
  }

  const result = await uploadToCloudinary(file.buffer, "videos", "video");

  const updated = await updateLectureVideoRepo({
    lectureId,
    creatorId,
    videoUrl: result.secure_url
  });

  if (!updated) {
    throw new AppError("lecture not found or forbidden", 404);
  }

  return updated;
}

async function getCreatorCoursesService(creatorId) {
  return await getCreatorCoursesRepo(creatorId);
}

async function updateCourseService({ courseId, creatorId, data }) {
  const updated = await updateCourseRepo({ courseId, creatorId, data });

  if (!updated) {
    throw new AppError("course not found or forbidden", 404);
  }

  return updated;
}

async function createSectionService({ title, courseId, creatorId }) {
  const maxOrder = await getMaxSectionOrder(courseId);

  const section = await createSectionRepo({
    title,
    courseId,
    creatorId,
    orderIndex: maxOrder + 1
  });

  if (!section) {
    throw new AppError("course not found or forbidden", 404);
  }

  return section;
}

async function createLectureService({ title, sectionId, creatorId, isPreview }) {
  const maxOrder = await getMaxLectureOrder(sectionId);

  const lecture = await createLectureRepo({
    title,
    sectionId,
    creatorId,
    orderIndex: maxOrder + 1,
    isPreview
  });

  if (!lecture) {
    throw new AppError("section not found or forbidden", 404);
  }

  return lecture;
}

async function updateLectureVideoService({ lectureId, creatorId, file }) {
  if (!file) {
    throw new AppError("file required", 400);
  }

  const result = await uploadToCloudinary(file.buffer, "videos", "video");

  const updated = await updateLectureVideoRepo({
    lectureId,
    creatorId,
    videoUrl: result.secure_url
  });

  if (!updated) {
    throw new AppError("lecture not found or forbidden", 404);
  }

  return updated;
}

async function updateCourseThumbnailService({ courseId, creatorId, file }) {
  if (!file) {
    throw new AppError("file required", 400);
  }

  const result = await uploadToCloudinary(file.buffer, "thumbnails", "image");

  const updated = await updateCourseThumbnailRepo({
    courseId,
    creatorId,
    url: result.secure_url
  });

  if (!updated) {
    throw new AppError("course not found or forbidden", 404);
  }

  return updated;
}

async function publishCourseService(courseId, creatorId) {
  const course = await publishCourseRepo(courseId, creatorId);

  if (!course) {
    throw new AppError("course not found or forbidden", 404);
  }

  return course;
}

async function unpublishCourseService(courseId, creatorId) {
  const course = await unpublishCourseRepo(courseId, creatorId);

  if (!course) {
    throw new AppError("course not found or forbidden", 404);
  }

  return course;
}

module.exports = {
  createCreatorService,
  getPublicCreatorCoursesService,
  createCourseService,
  uploadLectureVideoService,
  getCreatorCoursesService,
  updateCourseService,
  createSectionService,
  createLectureService,
  updateLectureVideoService,
  updateCourseThumbnailService,
  publishCourseService,
  unpublishCourseService

};