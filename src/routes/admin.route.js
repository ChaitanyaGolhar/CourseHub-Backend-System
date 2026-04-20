const express = require("express");
const router = express.Router();

const { createCourseHandler, publish, unpublish, createSectionHandler, createLectureHandler } = require("../controllers/admin.controller");
const { createCourseHandlerSchema, publishUnpublishSchema, createSectionHandlerScheme, createLectureHandlerScheme } = require("../validators/admin.validator");
const validate = require("../middleware/validate.middleware");
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const asyncHandler = require("../utils/asyncHandler");

router.post("/create", auth, admin, validate(createCourseHandlerSchema), asyncHandler(createCourseHandler));
router.post("/publish/:id", auth, admin, validate(publishUnpublishSchema), asyncHandler(publish));
router.post("/unpublish/:id", auth, admin, validate(publishUnpublishSchema), asyncHandler(unpublish));
router.post("/section", auth, admin, validate(createSectionHandlerScheme), asyncHandler(createSectionHandler));
router.post("/lecture", auth, admin, validate(createLectureHandlerScheme), asyncHandler(createLectureHandler))

module.exports = router;
