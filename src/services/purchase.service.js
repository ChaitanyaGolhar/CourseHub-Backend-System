const pool = require("../config/db");
const AppError = require("../utils/AppError");

async function purchaseCourseService({ userId, courseId }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const exists = await client.query(
      `SELECT 1 FROM purchases WHERE user_id = $1 AND course_id = $2`,
      [userId, courseId]
    );

    if (exists.rows.length) {
      throw new AppError("already purchased", 400);
    }

    await client.query(
      `INSERT INTO purchases (user_id, course_id) VALUES ($1, $2)`,
      [userId, courseId]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { purchaseCourseService };