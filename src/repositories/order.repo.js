const pool = require("../config/db");

async function createOrderInDB({ userId, courseId, amount, razorpayOrderId }) {
  const result = await pool.query(
    `INSERT INTO orders (user_id, course_id, amount, razorpay_order_id, status)
     VALUES ($1, $2, $3, $4, 'created')
     RETURNING *`,
    [userId, courseId, amount, razorpayOrderId]
  );
  return result.rows[0];
}

async function findOrderByRazorpayId(razorpayOrderId) {
  const result = await pool.query(
    `SELECT * FROM orders WHERE razorpay_order_id = $1`,
    [razorpayOrderId]
  );
  return result.rows[0];
}

async function updateOrderStatus(orderId, status) {
  const result = await pool.query(
    `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
    [status, orderId]
  );
  return result.rows[0];
}

module.exports = {
  createOrderInDB,
  findOrderByRazorpayId,
  updateOrderStatus
};