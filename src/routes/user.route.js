const express = require("express");
const router = express.Router();

const { getProfile } = require("../controllers/user.controller");
const auth = require("../middleware/auth.middleware");

router.get("/profile", auth, getProfile);



module.exports = router;