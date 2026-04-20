const express = require("express");
const router = express.Router();

const { getCourses, purchaseCourse, getPurchasedCourses, getCourseContent } = require("../controllers/course.controller");
const auth = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { getCoursesSchema, purchaseCourseSchema, getCourseContentSchema } = require("../validators/course.validator");
const asyncHandler = require("../utils/asyncHandler");
const optionalAuth = require("../middleware/optionalAuthMiddleware");

router.get("/", validate(getCoursesSchema), asyncHandler(getCourses));
router.post("/purchase/:id", auth, validate(purchaseCourseSchema), asyncHandler(purchaseCourse));
router.get("/purchased", auth, asyncHandler(getPurchasedCourses));
router.get("/:id/content", optionalAuth, validate(getCourseContentSchema), asyncHandler(getCourseContent))

module.exports = router;