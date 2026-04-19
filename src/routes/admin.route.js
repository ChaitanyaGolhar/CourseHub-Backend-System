const express = require("express");
const router = express.Router();

const { createCourseHandler, publish, unpublish } = require("../controllers/admin.controller");
const { createCourseHandlerSchema, publishUnpublishSchema } = require("../validators/admin.validator");
const validate = require("../middleware/validate.middleware");
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");

router.post("/course", auth, admin, validate(createCourseHandlerSchema), createCourseHandler);
router.post("/publish/:id", auth, admin, validate(publishUnpublishSchema), publish);
router.post("/unpublish/:id", auth, admin, validate(publishUnpublishSchema), unpublish);

module.exports = router;
