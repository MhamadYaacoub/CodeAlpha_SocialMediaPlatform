const Like = require("../models/Like");
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const { notify } = require("../services/notificationService");

const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (typeof req.body?.liked === "boolean") {
      if (req.body.liked) {
        const [, created] = await Like.findOrCreate({
          where: { userId: req.user.id, postId: post.id },
          defaults: { userId: req.user.id, postId: post.id },
        });
        if (created) await notify({ userId: post.userId, actorId: req.user.id, type: "like", postId: post.id });
      } else {
        await Like.destroy({ where: { userId: req.user.id, postId: post.id } });
        await Notification.destroy({ where: { userId: post.userId, actorId: req.user.id, type: "like", postId: post.id } });
      }
      const likesCount = await Like.count({ where: { postId: post.id } });
      return res.json({ message: req.body.liked ? "Post liked successfully" : "Post unliked successfully", liked: req.body.liked, likesCount });
    }

    const existingLike = await Like.findOne({
      where: {
        userId: req.user.id,
        postId,
      },
    });

    if (existingLike) {
      await existingLike.destroy();
      await Notification.destroy({ where: { userId: post.userId, actorId: req.user.id, type: "like", postId: post.id } });
      const likesCount = await Like.count({ where: { postId } });

      return res.json({
        message: "Post unliked successfully",
        liked: false,
        likesCount,
      });
    }

    await Like.create({
      userId: req.user.id,
      postId,
    });
    await notify({ userId: post.userId, actorId: req.user.id, type: "like", postId: post.id });
    const likesCount = await Like.count({ where: { postId } });

    return res.status(201).json({
      message: "Post liked successfully",
      liked: true,
      likesCount,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getPostLikes = async (req, res) => {
  try {
    const { postId } = req.params;

    const count = await Like.count({
      where: {
        postId,
      },
    });

    return res.json({
      postId: Number(postId),
      likesCount: count,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  toggleLike,
  getPostLikes,
};
