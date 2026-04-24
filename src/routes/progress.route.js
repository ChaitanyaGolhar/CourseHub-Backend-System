const express = require("express");
const router = express.Router();
const { completeLecture, getCourseProgress } = require("../controllers/progress.controller");
const auth = require("../middleware/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");

router.post("/lecture/:id/complete", auth, asyncHandler(completeLecture));
router.get("/course/:id", auth, asyncHandler(getCourseProgress));

module.exports = router;