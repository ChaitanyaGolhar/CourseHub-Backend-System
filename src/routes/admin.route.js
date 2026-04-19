const express = require("express");
const router = express.Router();

const { createCourseHandler, publish, unpublish } = require("../controllers/admin.controller");
const { createCourseHandlerSchema, publishUnpublishSchema } = require("../validators/admin.validator");
const validate = require("../middleware/validate.middleware");
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const asyncHandler = require("../utils/asyncHandler");

router.post("/course", auth, admin, validate(createCourseHandlerSchema), asyncHandler(createCourseHandler));
router.post("/publish/:id", auth, admin, validate(publishUnpublishSchema), asyncHandler(publish));
router.post("/unpublish/:id", auth, admin, validate(publishUnpublishSchema), asyncHandler(unpublish));

module.exports = router;
