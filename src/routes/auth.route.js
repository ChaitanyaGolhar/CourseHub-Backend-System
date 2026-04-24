const express = require("express");
const router = express.Router();

const { signup, login, googleLogin } = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");
const { signupSchema, loginSchema } = require("../validators/auth.validator");
const asyncHandler = require("../utils/asyncHandler");
const { authLimiter } = require("../middleware/rateLimit.middleware");

router.post("/signup", authLimiter, validate(signupSchema), asyncHandler(signup));
router.post("/login", authLimiter, validate(loginSchema), asyncHandler(login));
router.post("/google",authLimiter, asyncHandler(googleLogin));

module.exports = router;