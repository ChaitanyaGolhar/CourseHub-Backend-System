const multer = require("multer");

const storage = multer.memoryStorage({
    limits: { fileSize: 100 * 1024 * 1024 }
});

const upload = multer({ storage });

module.exports = upload;