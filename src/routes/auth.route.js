const express = require("express");
const router = express.Router();

const { signup, login } = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");
const { signupSchema, loginSchema } = require("../validators/auth.validator");
const asyncHandler = require("../utils/asyncHandler");

router.post("/signup", validate(signupSchema), asyncHandler(signup));
router.post("/login", validate(loginSchema), asyncHandler(login));

module.exports = router;