const express = require("express");
const router = express.Router();

const { createCourseHandler, publish, unpublish, createSectionHandler, createLectureHandler, uploadThumbnail, uploadLectureVideo } = require("../controllers/admin.controller");
const { createCourseHandlerSchema, publishUnpublishSchema, createSectionHandlerScheme, createLectureHandlerScheme, uploadThumbnailScheme, uploadLectureVideoScheme } = require("../validators/admin.validator");
const validate = require("../middleware/validate.middleware");
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const asyncHandler = require("../utils/asyncHandler");
const upload = require("../middleware/upload.middleware");

router.post("/create", auth, admin, upload.single("file"), validate(createCourseHandlerSchema), asyncHandler(createCourseHandler));
router.post("/publish/:id", auth, admin, validate(publishUnpublishSchema), asyncHandler(publish));
router.post("/unpublish/:id", auth, admin, validate(publishUnpublishSchema), asyncHandler(unpublish));
router.post("/section", auth, admin, validate(createSectionHandlerScheme), asyncHandler(createSectionHandler));
router.post("/lecture", auth, admin, validate(createLectureHandlerScheme), asyncHandler(createLectureHandler));
router.post("/upload/:courseId/thumbnail", auth, admin, upload.single("file"), validate(uploadThumbnailScheme), asyncHandler(uploadThumbnail));
router.post("/lectures/:sectionId/:lectureId/video", auth, admin, upload.single("file"), validate(uploadLectureVideoScheme), asyncHandler(uploadLectureVideo));

module.exports = router;
