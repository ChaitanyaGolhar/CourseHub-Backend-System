const pool = require("../config/db");

async function createCourse(title, price, description, thumbnail_url, creatorId) {
  const res = await pool.query(
    `INSERT INTO courses (title, price, description, thumbnail_url, creator_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [title, price, description, thumbnail_url, creatorId]
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

async function createSection(title, courseId, orderIndex) {
  const res = await pool.query(
    `INSERT INTO sections (title, course_id, order_index)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [title, courseId, orderIndex]
  );

  return res.rows[0];
}

async function getMaxSectionOrder(courseId) {
  const res = await pool.query(
    `SELECT COALESCE(MAX(order_index), 0) AS max_order
     FROM sections
     WHERE course_id = $1`,
    [courseId]
  );

  return res.rows[0].max_order;
}

async function findSectionById(sectionId) {
  const res = await pool.query(
    `SELECT * FROM sections WHERE id = $1`,
    [sectionId]
  );

  return res.rows[0];
}

async function updateCourseThumbnail(id, videoUrl) {
  const res = await pool.query(
    `UPDATE courses
     SET thumbnail_url = $1
     WHERE id = $2
     RETURNING *`,
    [videoUrl, id]
  );

  return res.rows[0];
}

async function getMaxLectureOrder(sectionId) {
  const res = await pool.query(
    `SELECT COALESCE(MAX(order_index), 0) AS max_order
     FROM lectures
     WHERE section_id = $1`,
    [sectionId]
  );

  return res.rows[0].max_order;
}

async function createLecture(title, videoUrl, sectionId, orderIndex, isPreview) {
  const res = await pool.query(
    `INSERT INTO lectures (title, video_url, section_id, order_index, is_preview)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [title, videoUrl, sectionId, orderIndex, isPreview]
  );

  return res.rows[0];
}

async function getSectionsByCourse(courseId) {
  const res = await pool.query(
    `SELECT * FROM sections
     WHERE course_id = $1
     ORDER BY order_index ASC`,
    [courseId]
  );

  return res.rows;
}

async function getLecturesByCourse(courseId) {
  const res = await pool.query(
    `SELECT l.*
     FROM lectures l
     JOIN sections s ON l.section_id = s.id
     WHERE s.course_id = $1
     ORDER BY l.order_index ASC`,
    [courseId]
  );

  return res.rows;
}

module.exports = {
  createCourse,
  findCourseById,
  getCoursesWithCount,
  publishCourse,
  unpublishCourse,
  createSection,
  getMaxSectionOrder,
  findSectionById,
  getMaxLectureOrder,
  createLecture,
  getSectionsByCourse,
  getLecturesByCourse,
  updateCourseThumbnail
};