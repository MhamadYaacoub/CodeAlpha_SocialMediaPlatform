const Follow = require("../models/Follow");
const User = require("../models/User");
const FollowRequest = require("../models/FollowRequest");
const Notification = require("../models/Notification");
const { notify } = require("../services/notificationService");

const toggleFollow = async (req, res) => {
  try {
    const targetUserId = Number(req.params.userId);
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({
        message: "You cannot follow yourself",
      });
    }

    const targetUser = await User.findByPk(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const existingFollow = await Follow.findOne({
      where: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    });

    if (existingFollow) {
      await existingFollow.destroy();

      return res.json({
        message: "User unfollowed successfully",
        following: false,
        requestStatus: null,
      });
    }

    let request = await FollowRequest.findOne({ where: { requesterId: currentUserId, targetUserId } });
    if (request?.status === "pending") return res.json({ message: "Follow request already pending", following: false, requestStatus: "pending" });
    if (request) await request.update({ status: "pending" });
    else request = await FollowRequest.create({ requesterId: currentUserId, targetUserId });
    await Notification.destroy({ where: { type: "follow_request", actorId: currentUserId, userId: targetUserId } });
    await notify({ userId: targetUserId, actorId: currentUserId, type: "follow_request", followRequestId: request.id });

    return res.status(201).json({
      message: "Follow request sent",
      following: false,
      requestStatus: "pending",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const respondToFollowRequest = async (req, res) => {
  try {
    const request = await FollowRequest.findByPk(req.params.requestId);
    if (!request || request.targetUserId !== req.user.id) return res.status(404).json({ message: "Follow request not found" });
    const action = req.body.action;
    if (!["accept", "decline"].includes(action)) return res.status(400).json({ message: "Action must be accept or decline" });
    if (request.status !== "pending") return res.json({ message: `Follow request already ${request.status}`, status: request.status, requesterId: request.requesterId, alreadyProcessed: true });
    if (action === "accept") {
      await Follow.findOrCreate({ where: { followerId: request.requesterId, followingId: req.user.id } });
      await request.update({ status: "accepted" });
      await notify({ userId: request.requesterId, actorId: req.user.id, type: "follow_accepted", followRequestId: request.id });
    } else await request.update({ status: "declined" });
    await Notification.update({ readAt: new Date() }, { where: { userId: req.user.id, followRequestId: request.id, type: "follow_request" } });
    return res.json({ message: action === "accept" ? "Follow request accepted" : "Follow request declined", status: request.status, requesterId: request.requesterId });
  } catch (error) { console.error(error); return res.status(500).json({ message: "Server error" }); }
};

const getFollowers = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    const followers = await Follow.findAll({
      where: {
        followingId: userId,
      },
      include: [
        {
          model: User,
          as: "follower",
          attributes: ["id", "name", "username", "profileImage"],
        },
      ],
    });

    return res.json({
      followers,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getFollowing = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    const following = await Follow.findAll({
      where: {
        followerId: userId,
      },
      include: [
        {
          model: User,
          as: "followingUser",
          attributes: ["id", "name", "username", "profileImage"],
        },
      ],
    });

    return res.json({
      following,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  toggleFollow,
  getFollowers,
  getFollowing,
  respondToFollowRequest,
};
