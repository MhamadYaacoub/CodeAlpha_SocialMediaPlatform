const Post = require("../models/Post");
const User = require("../models/User");
const Like = require("../models/Like");
const Comment = require("../models/Comment");
const Follow = require("../models/Follow");
const FollowRequest = require("../models/FollowRequest");

const createPost = async (req, res) => {
  try {
    const { content, imageUrl, mediaUrl, mediaType, musicUrl, musicTitle } = req.body;

    if ((!content || !content.trim()) && !mediaUrl && !imageUrl) {
      return res.status(400).json({
        message: "Post content is required",
      });
    }

    const post = await Post.create({
      content: String(content || "").trim(),
      imageUrl: imageUrl || null,
      mediaUrl: mediaUrl || imageUrl || null,
      mediaType: mediaType || (imageUrl ? "image" : null),
      musicUrl: musicUrl || null,
      musicTitle: musicTitle || null,
      userId: req.user.id,
    });

    return res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "username", "profileImage"],
        },
        { model: Like, as: "likes", attributes: ["userId"] },
        { model: Comment, as: "comments", attributes: ["id"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    const authorIds = [...new Set(posts.map((post) => post.userId).filter((id) => id !== req.user.id))];
    const [follows, requests] = await Promise.all([
      Follow.findAll({ where: { followerId: req.user.id, followingId: authorIds }, attributes: ["followingId"] }),
      FollowRequest.findAll({ where: { requesterId: req.user.id, targetUserId: authorIds, status: "pending" }, attributes: ["targetUserId"] }),
    ]);
    const followedIds = new Set(follows.map((item) => item.followingId));
    const requestedIds = new Set(requests.map((item) => item.targetUserId));

    return res.json({
      posts: posts.map((post) => {
        const data = post.toJSON();
        data.user.following = followedIds.has(data.userId);
        data.user.requestStatus = requestedIds.has(data.userId) ? "pending" : null;
        return { ...data, likesCount: data.likes.length, commentsCount: data.comments.length,
          liked: req.user ? data.likes.some((like) => like.userId === req.user.id) : false,
          likes: undefined, comments: undefined };
      }),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "username", "profileImage"],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    return res.json({
      post,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const { content, imageUrl, mediaUrl, mediaType, musicUrl, musicTitle } = req.body;

    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (post.userId !== req.user.id) {
      return res.status(403).json({
        message: "You cannot edit this post",
      });
    }

    if (content !== undefined) {
      if (!String(content).trim()) return res.status(400).json({ message: "Post content is required" });
      post.content = String(content).trim();
    }

    if (imageUrl !== undefined) {
      post.imageUrl = imageUrl;
    }
    if (mediaUrl !== undefined) post.mediaUrl = mediaUrl || null;
    if (mediaType !== undefined) post.mediaType = mediaType || null;
    if (musicUrl !== undefined) post.musicUrl = musicUrl || null;
    if (musicTitle !== undefined) post.musicTitle = musicTitle || null;

    await post.save();

    return res.json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (post.userId !== req.user.id) {
      return res.status(403).json({
        message: "You cannot delete this post",
      });
    }

    await post.destroy();

    return res.json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
};
