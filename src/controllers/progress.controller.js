const { completeLectureService, getCourseProgressService } = require("../services/progress.service");

async function completeLecture(req, res) {
  const lectureId = parseInt(req.params.id);

  const data = await completeLectureService({
    userId: req.user.id,
    lectureId
  });

  return res.json({
    success: true,
    data
  });
}

async function getCourseProgress(req, res) {
  const courseId = parseInt(req.params.id);

  const completedLectures = await getCourseProgressService({
    userId: req.user.id,
    courseId
  });

  return res.json({
    success: true,
    data: {
      completedLectures
    }
  });
}

module.exports = {
  completeLecture,
  getCourseProgress
};