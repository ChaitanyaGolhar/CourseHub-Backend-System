const AppError = require("../utils/AppError");
const { findCourseById, getSectionsByCourse, getLecturesByCourse } = require("../repositories/course.repo");
const { isAlreadyPurchased } = require("../repositories/purchase.repo");

async function getCourseContentService({ courseId, user }) {
  const course = await findCourseById(courseId);
  if (!course) throw new AppError("course not found", 404);

  const [sections, lectures] = await Promise.all([
    getSectionsByCourse(courseId),
    getLecturesByCourse(courseId)
  ]);

  let hasFullAccess = false;

  if (user) {
    if (course.creator_id === user.id) {
      hasFullAccess = true;
    } else {
      const purchased = await isAlreadyPurchased(user.id, courseId);
      hasFullAccess = !!purchased;
    }
  }

  // group
  const sectionMap = {};
  for (const s of sections) {
    sectionMap[s.id] = { id: s.id, title: s.title, lectures: [] };
  }

  for (const l of lectures) {
    if (!hasFullAccess && !l.is_preview) continue;
    const bucket = sectionMap[l.section_id];
    if (bucket) {
      bucket.lectures.push({
        id: l.id,
        title: l.title,
        video_url: l.video_url,
        is_preview: l.is_preview
      });
    }
  }

  return {
    course: {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail_url: course.thumbnail_url,
      sections: Object.values(sectionMap)
    },
    access: { fullAccess: hasFullAccess }
  };
}

module.exports = { getCourseContentService };