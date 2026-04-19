const express = require("express");
const router = express.Router();

const { getProfile } = require("../controllers/user.controller");
const auth = require("../middleware/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");

router.get("/profile", auth, asyncHandler(getProfile));



module.exports = router;