const pool = require("../config/db");


// ==================== COURSES ====================

// Create course (already correct — uses creatorId)
async function createCourse(title, price, description, thumbnail_url, creatorId) {
  const res = await pool.query(
    `INSERT INTO courses (title, price, description, thumbnail_url, creator_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [title, price, description, thumbnail_url, creatorId]
  );
  return res.rows[0];
}


// 🔒 Find course WITH ownership check
async function findCourseByIdAndCreator(courseId, creatorId) {
  const res = await pool.query(
    `SELECT * FROM courses
     WHERE id = $1 AND creator_id = $2`,
    [courseId, creatorId]
  );
  return res.rows[0];
}


// Public fetch (no ownership)
async function findCourseById(courseId) {
  const res = await pool.query(
    `SELECT * FROM courses WHERE id = $1`,
    [courseId]
  );
  return res.rows[0];
}


// Creator lookup (belongs in creator.repo ideally, but OK for now)
async function findCreatorByUserId(userId) {
  const res = await pool.query(
    `SELECT * FROM creators WHERE user_id = $1`,
    [userId]
  );
  return res.rows[0];
}


// Publish / Unpublish WITH ownership
async function publishCourse(courseId, creatorId) {
  const res = await pool.query(
    `UPDATE courses
     SET is_published = true
     WHERE id = $1 AND creator_id = $2
     RETURNING *`,
    [courseId, creatorId]
  );
  return res.rows[0];
}

async function unpublishCourse(courseId, creatorId) {
  const res = await pool.query(
    `UPDATE courses
     SET is_published = false
     WHERE id = $1 AND creator_id = $2
     RETURNING *`,
    [courseId, creatorId]
  );
  return res.rows[0];
}


// Public courses
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


// ==================== SECTIONS ====================

// 🔒 Create section ONLY if course belongs to creator
async function createSection(title, courseId, orderIndex, creatorId) {
  const res = await pool.query(
    `
    INSERT INTO sections (title, course_id, order_index)
    SELECT $1, $2, $3
    WHERE EXISTS (
      SELECT 1 FROM courses
      WHERE id = $2 AND creator_id = $4
    )
    RETURNING *
    `,
    [title, courseId, orderIndex, creatorId]
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


// 🔒 Section with ownership
async function findSectionByIdAndCreator(sectionId, creatorId) {
  const res = await pool.query(
    `
    SELECT s.*
    FROM sections s
    JOIN courses c ON s.course_id = c.id
    WHERE s.id = $1 AND c.creator_id = $2
    `,
    [sectionId, creatorId]
  );

  return res.rows[0];
}


// ==================== LECTURES ====================

// 🔒 Create lecture safely
async function createLecture(title, videoUrl, sectionId, orderIndex, isPreview, creatorId) {
  const res = await pool.query(
    `
    INSERT INTO lectures (title, video_url, section_id, order_index, is_preview)
    SELECT $1, $2, $3, $4, $5
    WHERE EXISTS (
      SELECT 1
      FROM sections s
      JOIN courses c ON s.course_id = c.id
      WHERE s.id = $3 AND c.creator_id = $6
    )
    RETURNING *
    `,
    [title, videoUrl, sectionId, orderIndex, isPreview, creatorId]
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


// 🔒 Lecture with ownership
async function findLectureByIdAndCreator(lectureId, creatorId) {
  const res = await pool.query(
    `
    SELECT l.*
    FROM lectures l
    JOIN sections s ON l.section_id = s.id
    JOIN courses c ON s.course_id = c.id
    WHERE l.id = $1 AND c.creator_id = $2
    `,
    [lectureId, creatorId]
  );

  return res.rows[0];
}


// 🔒 Update lecture video safely
async function updateLectureVideo(lectureId, videoUrl, creatorId) {
  const res = await pool.query(
    `
    UPDATE lectures l
    SET video_url = $1
    FROM sections s, courses c
    WHERE l.section_id = s.id
      AND s.course_id = c.id
      AND l.id = $2
      AND c.creator_id = $3
    RETURNING l.*
    `,
    [videoUrl, lectureId, creatorId]
  );

  return res.rows[0];
}


// ==================== PUBLIC READ ====================

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


// ==================== EXPORT ====================

module.exports = {
  createCourse,
  findCourseById,
  findCourseByIdAndCreator,
  findCreatorByUserId,
  getCoursesWithCount,
  publishCourse,
  unpublishCourse,
  createSection,
  getMaxSectionOrder,
  findSectionByIdAndCreator,
  getMaxLectureOrder,
  createLecture,
  getSectionsByCourse,
  getLecturesByCourse,
  updateLectureVideo,
  findLectureByIdAndCreator
};