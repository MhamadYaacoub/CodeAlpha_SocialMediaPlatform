const { Op } = require("sequelize");
const User = require("../models/User");
const Post = require("../models/Post");
const Follow = require("../models/Follow");
const FollowRequest = require("../models/FollowRequest");
const Like = require("../models/Like");
const Comment = require("../models/Comment");

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ["password"],
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const where = { id: { [Op.ne]: req.user.id } };
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { username: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const users = await User.findAll({
      where,
      attributes: ["id", "name", "username", "bio", "profileImage"],
      limit: 30,
      order: [["name", "ASC"]],
    });
    const following = await Follow.findAll({
      where: { followerId: req.user.id, followingId: users.map((user) => user.id) },
      attributes: ["followingId"],
    });
    const followedIds = new Set(following.map((item) => item.followingId));
    const pending = await FollowRequest.findAll({ where: { requesterId: req.user.id, targetUserId: users.map((user) => user.id), status: "pending" }, attributes: ["targetUserId"] });
    const pendingIds = new Set(pending.map((item) => item.targetUserId));
    return res.json({ users: users.map((user) => ({ ...user.toJSON(), following: followedIds.has(user.id), requestStatus: pendingIds.has(user.id) ? "pending" : null })) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password", "email"] },
      include: [{ model: Post, as: "posts", separate: true, order: [["createdAt", "DESC"]], include: [{ model: Like, as: "likes", attributes: ["userId"] }, { model: Comment, as: "comments", attributes: ["id"] }] }],
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    const [followersCount, followingCount, relationship, pendingRequest] = await Promise.all([
      Follow.count({ where: { followingId: user.id } }),
      Follow.count({ where: { followerId: user.id } }),
      Follow.findOne({ where: { followerId: req.user.id, followingId: user.id } }),
      FollowRequest.findOne({ where: { requesterId: req.user.id, targetUserId: user.id, status: "pending" } }),
    ]);
    const userData = user.toJSON();
    userData.posts = userData.posts.map((post) => ({ ...post, user: { id: userData.id, name: userData.name, username: userData.username, profileImage: userData.profileImage, following: Boolean(relationship), requestStatus: pendingRequest ? "pending" : null }, likesCount: post.likes.length, commentsCount: post.comments.length, liked: post.likes.some((like) => like.userId === req.user.id), likes: undefined, comments: undefined }));
    return res.json({ user: userData, followersCount, followingCount, following: Boolean(relationship), requestStatus: pendingRequest ? "pending" : null, isMe: user.id === req.user.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const name = String(req.body.name || "").trim();
    const bio = req.body.bio == null ? null : String(req.body.bio).trim();
    const profileImage = req.body.profileImage == null ? null : String(req.body.profileImage).trim();
    if (!name) return res.status(400).json({ message: "Name is required" });
    if (bio && bio.length > 300) return res.status(400).json({ message: "Bio cannot exceed 300 characters" });
    await user.update({ name, bio: bio || null, profileImage: profileImage || null });
    const result = user.toJSON();
    delete result.password;
    return res.json({ message: "Profile updated successfully", user: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getMyProfile,
  getUsers,
  getProfile,
  updateMyProfile,
};
