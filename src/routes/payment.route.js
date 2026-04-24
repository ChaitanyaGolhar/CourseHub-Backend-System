// src/routes/payment.route.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { createOrder, razorpayWebhook } = require("../controllers/payment.controller");

// Only authenticated users can create an order intent
router.post("/create-order/:courseId", auth, asyncHandler(createOrder));

// Webhooks DO NOT use the auth middleware because Razorpay servers call this, not the logged-in user
router.post("/webhook", asyncHandler(razorpayWebhook));

module.exports = router;