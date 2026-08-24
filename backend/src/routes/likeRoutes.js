const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const { toggleLike, getPostLikes } = require("../controllers/likeController");

const router = express.Router();

router.post("/posts/:postId/like", authMiddleware, toggleLike);
router.put("/posts/:postId/like", authMiddleware, toggleLike);

router.get("/posts/:postId/likes", getPostLikes);

module.exports = router;
