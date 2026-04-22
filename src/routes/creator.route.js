const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { createCreatorHandler, getPublicCreatorCoursesHandler, createCourseHandler, updateCourseHandler, getCoursePublicHandler, createSectionHandler, createLectureHandler, updateLectureVideoHandler, updateCourseThumbnailHandler, publishCourseHandler, unpublishCourseHandler } = require("../controllers/creator.controller");
const { createCreatorSchema, updateCourseSchema, createCourseSchema, createSectionSchema, createLectureSchema, updateLectureVideoSchema, updateCourseThumbnailSchema, publishUnpublishCourseSchema } = require("../validators/creator.validator");
const requireCreator = require("../middleware/creator.middleware");
const upload = require("../middleware/upload.middleware");

router.post("/create", auth, validate(createCreatorSchema), createCreatorHandler);
router.get("/:handle/courses", getPublicCreatorCoursesHandler);

router.post("/course", auth, requireCreator, upload.single("file"), validate(createCourseSchema), createCourseHandler);
router.get("/courses", getCoursePublicHandler);
router.patch("/course/:courseId", auth, requireCreator, upload.single("file"), validate(updateCourseSchema), updateCourseHandler);
router.post("/course/:courseId/section", auth, requireCreator, validate(createSectionSchema), createSectionHandler);
router.post("/course/:courseId/lecture", auth, requireCreator, upload.single("file"), validate(createLectureSchema), createLectureHandler);
router.post("/course/:courseId/lecture/:lectureId/video", auth, requireCreator, upload.single("file"), validate(updateLectureVideoSchema), updateLectureVideoHandler);
router.post("/course/:courseId/thumbnail", auth, requireCreator, upload.single("file"), validate(updateCourseThumbnailSchema), updateCourseThumbnailHandler);
router.patch("/course/:courseId/publish", auth, requireCreator, validate(publishUnpublishCourseSchema), publishCourseHandler);
router.patch("/course/:courseId/unpublish", auth, requireCreator, validate(publishUnpublishCourseSchema), unpublishCourseHandler);



module.exports = router;