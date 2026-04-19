const express = require("express");

const userRoutes = require("./user.route");
const courseRoutes = require("./course.route");
const adminRoutes = require("./admin.route");
const authRoutes = require("./auth.route")

const router = express.Router();

router.use("/user", userRoutes);
router.use("/course", courseRoutes);
router.use("/admin", adminRoutes);
router.use("/auth", authRoutes)

module.exports = router;