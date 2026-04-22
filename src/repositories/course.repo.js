const pool = require("../config/db");

// ==================== COURSES ====================
async function createCourseRepo({ title, description, price, thumbnailUrl, creatorId }) {
  const res = await pool.query(
    `INSERT INTO courses (title, description, price, thumbnail_url, creator_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [title, description, price, thumbnailUrl, creatorId]
  );
  return res.rows[0];
}

async function getCreatorCoursesRepo(creatorId) {
  const res = await pool.query(
    `
    SELECT id, title, description, price, thumbnail_url, is_published, created_at
    FROM courses
    WHERE creator_id = $1
    ORDER BY created_at DESC
    `,
    [creatorId]
  );

  return res.rows;
}

async function updateCourseRepo({ courseId, creatorId, data }) {
  const { title, description, price } = data;

  const res = await pool.query(
    `
    UPDATE courses
    SET title = COALESCE($1, title),
        description = COALESCE($2, description),
        price = COALESCE($3, price)
    WHERE id = $4 AND creator_id = $5
    RETURNING *
    `,
    [title, description, price, courseId, creatorId]
  );

  return res.rows[0];
}

async function deleteCourseRepo(courseId, creatorId) {
  const res = await pool.query(
    `
    DELETE FROM courses
    WHERE id = $1 AND creator_id = $2
    RETURNING *
    `,
    [courseId, creatorId]
  );

  return res.rows[0];
}

async function createSectionRepo({ title, courseId, creatorId, orderIndex }) {
  const res = await pool.query(
    `
    INSERT INTO sections (title, course_id, order_index)
    SELECT $1, c.id, $4
    FROM courses c
    WHERE c.id = $2 AND c.creator_id = $3
    RETURNING *
    `,
    [title, courseId, creatorId, orderIndex]
  );

  return res.rows[0];
}

async function createLectureRepo({ title, sectionId, creatorId, orderIndex, isPreview }) {
  const res = await pool.query(
    `
    INSERT INTO lectures (title, section_id, order_index, is_preview)
    SELECT $1, s.id, $4, $5
    FROM sections s
    JOIN courses c ON s.course_id = c.id
    WHERE s.id = $2 AND c.creator_id = $3
    RETURNING *
    `,
    [title, sectionId, creatorId, orderIndex, isPreview]
  );

  return res.rows[0];
}

async function updateLectureVideoRepo({ lectureId, creatorId, videoUrl }) {
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

async function updateCourseThumbnailRepo({ courseId, creatorId, url }) {
  const res = await pool.query(
    `
    UPDATE courses
    SET thumbnail_url = $1
    WHERE id = $2 AND creator_id = $3
    RETURNING *
    `,
    [url, courseId, creatorId]
  );

  return res.rows[0];
}

async function getMaxSectionOrder(courseId) {
  const res = await pool.query(
    `SELECT COALESCE(MAX(order_index), 0) as max FROM sections WHERE course_id = $1`,
    [courseId]
  );
  return res.rows[0].max;
}

async function getMaxLectureOrder(sectionId) {
  const res = await pool.query(
    `SELECT COALESCE(MAX(order_index), 0) as max FROM lectures WHERE section_id = $1`,
    [sectionId]
  );
  return res.rows[0].max;
}

async function publishCourseRepo(courseId, creatorId) {
  const res = await pool.query(
    `
    UPDATE courses
    SET is_published = true
    WHERE id = $1 AND creator_id = $2
    RETURNING *
    `,
    [courseId, creatorId]
  );
  return res.rows[0];
}

async function unpublishCourseRepo(courseId, creatorId) {
  const res = await pool.query(
    `
    UPDATE courses
    SET is_published = false
    WHERE id = $1 AND creator_id = $2
    RETURNING *
    `,
    [courseId, creatorId]
  );
  return res.rows[0];
}

async function getPublishedCoursesByCreatorId(creatorId) {
  const res = await pool.query(
    `
    SELECT id, title, description, price, thumbnail_url, created_at
    FROM courses
    WHERE creator_id = $1
      AND is_published = true
    ORDER BY created_at DESC
    `,
    [creatorId]
  );

  return res.rows;
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

async function getSectionsByCourseRepo(courseId, creatorId) {
  const res = await pool.query(
    `
    SELECT s.*
    FROM sections s
    JOIN courses c ON s.course_id = c.id
    WHERE s.course_id = $1 AND c.creator_id = $2
    ORDER BY s.order_index ASC
    `,
    [courseId, creatorId]
  );

  return res.rows;
}

async function getLecturesBySectionRepo(sectionId, creatorId) {
  const res = await pool.query(
    `
    SELECT l.*
    FROM lectures l
    JOIN sections s ON l.section_id = s.id
    JOIN courses c ON s.course_id = c.id
    WHERE l.section_id = $1 AND c.creator_id = $2
    ORDER BY l.order_index ASC
    `,
    [sectionId, creatorId]
  );

  return res.rows;
}

async function getCreatorFullDataRepo(creatorId) {
  const res = await pool.query(
    `
    SELECT 
      c.id AS course_id,
      c.title AS course_title,
      c.description,
      c.price,
      c.thumbnail_url,
      c.is_published,
      c.created_at,

      s.id AS section_id,
      s.title AS section_title,
      s.order_index AS section_order,

      l.id AS lecture_id,
      l.title AS lecture_title,
      l.video_url,
      l.order_index AS lecture_order,
      l.is_preview

    FROM courses c
    LEFT JOIN sections s ON s.course_id = c.id
    LEFT JOIN lectures l ON l.section_id = s.id
    WHERE c.creator_id = $1
    ORDER BY 
      c.created_at DESC,
      s.order_index ASC,
      l.order_index ASC
    `,
    [creatorId]
  );

  return res.rows;
}

module.exports = {
  createCourseRepo,
  getCreatorCoursesRepo,
  updateCourseRepo,
  deleteCourseRepo,
  createSectionRepo,
  createLectureRepo,
  updateLectureVideoRepo,
  updateCourseThumbnailRepo,
  getMaxSectionOrder,
  getMaxLectureOrder,
  publishCourseRepo,
  unpublishCourseRepo,
  getPublishedCoursesByCreatorId,
  findCourseByIdAndCreator,
  findCourseById,
  getCoursesWithCount,
  getSectionsByCourseRepo,
  getLecturesBySectionRepo,
  getCreatorFullDataRepo

};