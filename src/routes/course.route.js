const express = require("express");
const router = express.Router();

const { getCourses, purchaseCourse, getPurchasedCourses } = require("../controllers/course.controller");
const auth = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { getCoursesSchema, purchaseCourseSchema } = require("../validators/course.validator");
const asyncHandler = require("../utils/asyncHandler");

router.get("/", validate(getCoursesSchema), asyncHandler(getCourses));
router.post("/purchase/:id", auth, validate(purchaseCourseSchema), asyncHandler(purchaseCourse));
router.get("/purchased", auth, asyncHandler(getPurchasedCourses));

module.exports = router;