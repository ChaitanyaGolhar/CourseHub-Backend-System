const express = require("express");
const router = express.Router();

const { signup, login } = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");
const { signupSchema, loginSchema } = require("../validators/auth.validator");

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);

module.exports = router;