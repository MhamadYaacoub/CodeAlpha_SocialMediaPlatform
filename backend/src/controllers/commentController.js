const Comment = require("../models/Comment");
const Post = require("../models/Post");
const User = require("../models/User");
const { notify } = require("../services/notificationService");

const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Comment content is required",
      });
    }

    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const comment = await Comment.create({
      content: content.trim(),
      userId: req.user.id,
      postId,
    });
    await notify({ userId: post.userId, actorId: req.user.id, type: "comment", postId: post.id });

    return res.status(201).json({
      message: "Comment created successfully",
      comment: await Comment.findByPk(comment.id, { include: [{ model: User, as: "user", attributes: ["id", "name", "username", "profileImage"] }] }),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.findAll({
      where: {
        postId,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "username", "profileImage"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    return res.json({
      comments,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (comment.userId !== req.user.id) {
      return res.status(403).json({
        message: "You cannot delete this comment",
      });
    }

    await comment.destroy();

    return res.json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createComment,
  getPostComments,
  deleteComment,
};
