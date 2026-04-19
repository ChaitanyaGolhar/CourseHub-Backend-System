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

async function getCoursesWithCount(limit, offset) {
  const dataQuery = `
    SELECT * FROM courses
    WHERE is_published = true
    ORDER BY id DESC
    LIMIT $1 OFFSET $2
  `;

  const countQuery = `
    SELECT COUNT(*) FROM courses
    WHERE is_published = true
  `;

  const [dataRes, countRes] = await Promise.all([
    pool.query(dataQuery, [limit, offset]),
    pool.query(countQuery)
  ]);

  return {
    courses: dataRes.rows,
    total: parseInt(countRes.rows[0].count)
  };
}

module.exports = {
  createCourse,
  findCourseById,
  getCoursesWithCount,
  publishCourse,
  unpublishCourse
};