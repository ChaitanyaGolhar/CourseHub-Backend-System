const express = require("express");
const router = express.Router();

const { getProfile, getMyCourses, } = require("../controllers/user.controller");
const auth = require("../middleware/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");

router.get("/me", auth, asyncHandler(getProfile));
router.get("/me/courses", auth, asyncHandler(getMyCourses));


module.exports = router;