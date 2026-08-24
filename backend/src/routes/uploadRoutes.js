const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { upload } = require("../controllers/uploadController");
const router = express.Router();
router.post("/", authMiddleware, express.raw({ type: "application/octet-stream", limit: "50mb" }), upload);
module.exports = router;
