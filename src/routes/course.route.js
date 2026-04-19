const express = require("express");
const router = express.Router();

const { getCourses, purchaseCourse, getPurchasedCourses } = require("../controllers/course.controller");
const auth = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { getCoursesSchema, purchaseCourseSchema } = require("../validators/course.validator");

router.get("/", validate(getCoursesSchema), getCourses);
router.post("/purchase/:id", auth, validate(purchaseCourseSchema), purchaseCourse);
router.get("/purchased", auth, getPurchasedCourses);

module.exports = router;