const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  createStatus,
  getActiveStatuses,
  viewStatus,
  getStatusViewers,
  deleteStatus,
} = require("../controllers/statusController");

const router = express.Router();

router.post("/statuses", authMiddleware, createStatus);

router.get("/statuses", authMiddleware, getActiveStatuses);

router.get("/statuses/:statusId", authMiddleware, viewStatus);

router.get("/statuses/:statusId/viewers", authMiddleware, getStatusViewers);

router.delete("/statuses/:statusId", authMiddleware, deleteStatus);

module.exports = router;
