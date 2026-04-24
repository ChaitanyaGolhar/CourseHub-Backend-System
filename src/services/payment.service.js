const razorpay = require("../config/razorpay");

async function createOrderService({ amount, currency = "INR" }) {
  const order = await razorpay.orders.create({
    amount: amount * 100, 
    currency,
    receipt: `receipt_${Date.now()}`
  });

  return order;
}

module.exports = { createOrderService };