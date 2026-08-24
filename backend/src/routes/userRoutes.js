const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const { getMyProfile, getUsers, getProfile, updateMyProfile } = require("../controllers/userController");

const router = express.Router();

router.get("/me", authMiddleware, getMyProfile);
router.patch("/me", authMiddleware, updateMyProfile);
router.get("/", authMiddleware, getUsers);
router.get("/:id", authMiddleware, getProfile);

module.exports = router;
