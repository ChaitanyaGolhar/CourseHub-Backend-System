const pool = require("../config/db");

async function findUserByEmail(email) {
  const res = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  return res.rows[0];
}

async function findUserByGoogleId(googleId) {
  const res = await pool.query(
    `SELECT * FROM users WHERE google_id = $1`,
    [googleId]
  );
  return res.rows[0];
}

async function createUser({
  email,
  password = null,
  googleId = null,
  name = null,
  avatar = null,
  provider = "local"
}) {
  const res = await pool.query(
    `INSERT INTO users (email, password, google_id, name, avatar, provider)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [email, password, googleId, name, avatar, provider]
  );

  return res.rows[0];
}

async function linkGoogleToUser(userId, googleId) {
  const res = await pool.query(
    `UPDATE users
     SET google_id = $1,
         provider = 'google'
     WHERE id = $2
     RETURNING *`,
    [googleId, userId]
  );

  return res.rows[0];
}

async function getUserCourses(userId) {
  const res = await pool.query(
    `SELECT c.*
     FROM purchases p
     JOIN courses c ON p.course_id = c.id
     WHERE p.user_id = $1`,
    [userId]
  );

  return res.rows;
}

async function findUserById(userId) {
  const res = await pool.query(
    `SELECT id, email, role
     FROM users
     WHERE id = $1`,
    [userId]
  );

  return res.rows[0];   
}

module.exports = {
  findUserByEmail,
  findUserByGoogleId,
  createUser,
  linkGoogleToUser,
  getUserCourses,
  findUserById
};