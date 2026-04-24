const pool = require("../config/db");

async function markLectureComplete(userId, lectureId) {
  const res = await pool.query(
    `INSERT INTO lecture_progress (user_id, lecture_id, is_completed, completed_at)
     VALUES ($1, $2, true, NOW())
     ON CONFLICT (user_id, lecture_id)
     DO UPDATE SET is_completed = true, completed_at = NOW()
     RETURNING *`,
    [userId, lectureId]
  );

  return res.rows[0];
}

async function getUserProgressForCourse(userId, courseId) {
  const res = await pool.query(
    `SELECT lp.lecture_id
     FROM lecture_progress lp
     JOIN lectures l ON lp.lecture_id = l.id
     JOIN sections s ON l.section_id = s.id
     WHERE lp.user_id = $1 AND s.course_id = $2`,
    [userId, courseId]
  );

  return res.rows;
}

module.exports = {
  markLectureComplete,
  getUserProgressForCourse
};