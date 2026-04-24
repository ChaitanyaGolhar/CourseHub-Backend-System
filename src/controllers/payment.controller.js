const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const { findCourseById } = require("../repositories/course.repo");
const { createOrderInDB, findOrderByRazorpayId, updateOrderStatus } = require("../repositories/order.repo");
const { createPurchase } = require("../repositories/purchase.repo"); 
const AppError = require("../utils/AppError");

async function createOrder(req, res) {
  const courseId = parseInt(req.params.courseId);
  const userId = req.user.id; 

  const course = await findCourseById(courseId);

  if (!course || !course.is_published) {
    throw new AppError("Invalid or unpublished course", 400);
  }

  const options = {
    amount: course.price * 100, 
    currency: "INR",
    receipt: `receipt_course_${courseId}_user_${userId}_${Date.now()}`
  };

  // 1. Create order on Razorpay servers
  const order = await razorpay.orders.create(options);

  // 2. Save the intent (order) in our database
  await createOrderInDB({
    userId,
    courseId,
    amount: course.price,
    razorpayOrderId: order.id
  });

  return res.status(201).json({
    success: true,
    data: order
  });
}

async function razorpayWebhook(req, res) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];

  // 1. Verify the signature to ensure the request is actually from Razorpay
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body)) // Note: Express must not alter the raw body for this to match
    .digest("hex");

  if (signature !== expectedSignature) {
    // Return 400 immediately if it's a fake webhook
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }

  const event = req.body;

  // 2. Process a successful payment
  if (event.event === "payment.captured") {
    const paymentEntity = event.payload.payment.entity;
    const razorpayOrderId = paymentEntity.order_id;

    // Find the order we saved earlier
    const order = await findOrderByRazorpayId(razorpayOrderId);
    
    if (order && order.status === 'created') {
      // Mark order as paid
      await updateOrderStatus(order.id, 'paid');
      
      // Grant Access! Create the actual purchase entry
      // Ensure createPurchase function exists in your purchase.repo.js
      await createPurchase(order.user_id, order.course_id, paymentEntity.amount / 100); 
    }
  }

  // 3. Always return 200 OK so Razorpay knows you received it, otherwise they will keep retrying
  return res.status(200).json({ success: true });
}

module.exports = { createOrder, razorpayWebhook };