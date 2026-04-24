const { markLectureComplete, getUserProgressForCourse } = require("../repositories/progress.repo");

async function completeLectureService({ userId, lectureId }) {
  return await markLectureComplete(userId, lectureId);
}

async function getCourseProgressService({ userId, courseId }) {
  const completed = await getUserProgressForCourse(userId, courseId);

  return completed.map(l => l.lecture_id);
}

module.exports = {
  completeLectureService,
  getCourseProgressService
};