const pool = require("../config/db");

async function findCreatorByUserId(userId) {
  const res = await pool.query(
    `SELECT * FROM creators WHERE user_id = $1`,
    [userId]
  );
  return res.rows[0];
}

async function findCreatorByHandle(handle) {
  const res = await pool.query(
    `SELECT * FROM creators WHERE handle = $1`,
    [handle]
  );
  return res.rows[0];
}

async function createCreator(userId, handle, brandName) {
  const res = await pool.query(
    `
    INSERT INTO creators (user_id, handle, brand_name)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [userId, handle, brandName]
  );

  return res.rows[0];
}

module.exports = {
  findCreatorByUserId,
  findCreatorByHandle,
  createCreator
};