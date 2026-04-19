const pool = require("../config/db");

async function createUser(email, password) {
  const res = await pool.query(
    `INSERT INTO users (email, password)
     VALUES ($1, $2)
     RETURNING id, email, role`,
    [email, password]
  );
  return res.rows[0];
}

async function findUserByEmail(email) {
  const res = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  return res.rows[0];
}

async function findUserById(id) {
  const res = await pool.query(
    `SELECT id, email, role FROM users WHERE id = $1`,
    [id]
  );
  return res.rows[0];
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById
};