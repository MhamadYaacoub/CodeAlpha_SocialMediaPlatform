const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { listNotifications, markAllRead } = require("../controllers/notificationController");
const router = express.Router();
router.get("/notifications", authMiddleware, listNotifications);
router.patch("/notifications/read", authMiddleware, markAllRead);
module.exports = router;
