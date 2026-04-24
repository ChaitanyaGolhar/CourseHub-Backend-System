const express = require("express");

const userRoutes = require("./user.route");
const courseRoutes = require("./course.route");
const creatorRoutes = require("./creator.route");
const authRoutes = require("./auth.route")
const progressRoutes = require("./progress.route");
const paymentRoutes = require("./payment.route");

const router = express.Router();

router.use("/user", userRoutes);
router.use("/course", courseRoutes);
router.use("/creator", creatorRoutes);
router.use("/auth", authRoutes)
router.use("/progress", progressRoutes);
router.use("/payment", paymentRoutes)

module.exports = router;