const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  createComment,
  getPostComments,
  deleteComment,
} = require("../controllers/commentController");

const router = express.Router();

router.post("/posts/:postId/comments", authMiddleware, createComment);

router.get("/posts/:postId/comments", getPostComments);

router.delete("/comments/:id", authMiddleware, deleteComment);

module.exports = router;
