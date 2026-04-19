const pool = require("../config/db");

async function isAlreadyPurchased(userId, courseId) {
  const res = await pool.query(
    `SELECT 1 FROM purchases WHERE user_id = $1 AND course_id = $2`,
    [userId, courseId]
  );
  return res.rows.length > 0;
}

async function createPurchase(userId, courseId) {
  const res = await pool.query(
    `INSERT INTO purchases (user_id, course_id)
     VALUES ($1, $2)
     RETURNING *`,
    [userId, courseId]
  );
  return res.rows[0];
}

async function getUserPurchases(userId) {
  const res = await pool.query(
    `SELECT c.*
     FROM courses c
     JOIN purchases p ON p.course_id = c.id
     WHERE p.user_id = $1`,
    [userId]
  );
  return res.rows;
}

module.exports = {
  isAlreadyPurchased,
  createPurchase,
  getUserPurchases
};