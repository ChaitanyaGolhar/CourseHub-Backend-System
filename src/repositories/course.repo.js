const pool = require("../config/db");

async function createCourse(title, price, creatorId) {
  const res = await pool.query(
    `INSERT INTO courses (title, price, creator_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [title, price, creatorId]
  );
  return res.rows[0];
}

async function findCourseById(id) {
  const res = await pool.query(
    `SELECT * FROM courses WHERE id = $1`,
    [id]
  );
  return res.rows[0];
}

async function getPublishedCourses(limit, offset) {
  const res = await pool.query(
    `SELECT * FROM courses
     WHERE is_published = true
     ORDER BY id DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return res.rows;
}

async function publishCourse(id) {
  await pool.query(
    `UPDATE courses SET is_published = true WHERE id = $1`,
    [id]
  );
}

async function unpublishCourse(id) {
  await pool.query(
    `UPDATE courses SET is_published = false WHERE id = $1`,
    [id]
  );
}

module.exports = {
  createCourse,
  findCourseById,
  getPublishedCourses,
  publishCourse,
  unpublishCourse
};