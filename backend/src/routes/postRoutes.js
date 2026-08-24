const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
} = require("../controllers/postController");

const router = express.Router();

router.get("/", authMiddleware, getPosts);
router.get("/:id", getPostById);

router.post("/", authMiddleware, createPost);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);

module.exports = router;
