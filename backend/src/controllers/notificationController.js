const { Op } = require("sequelize");
const Notification = require("../models/Notification");
const User = require("../models/User");
const FollowRequest = require("../models/FollowRequest");
const Follow = require("../models/Follow");

const listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({ where: { userId: req.user.id }, include: [{ model: User, as: "actor", attributes: ["id", "name", "username", "profileImage"] }], order: [["createdAt", "DESC"]], limit: 80 });
    const unreadCount = await Notification.count({ where: { userId: req.user.id, readAt: null } });
    const result = await Promise.all(notifications.map(async (notification) => {
      const data = notification.toJSON();
      if (data.followRequestId) {
        const request = await FollowRequest.findByPk(data.followRequestId, { attributes: ["status"] });
        data.requestStatus = request?.status || null;
        data.followingActor = Boolean(await Follow.findOne({ where: { followerId: req.user.id, followingId: data.actorId } }));
      }
      return data;
    }));
    return res.json({ notifications: result, unreadCount });
  } catch (error) { console.error(error); return res.status(500).json({ message: "Server error" }); }
};

const markAllRead = async (req, res) => {
  try { await Notification.update({ readAt: new Date() }, { where: { userId: req.user.id, readAt: { [Op.is]: null } } }); return res.json({ message: "Notifications marked as read" }); }
  catch (error) { console.error(error); return res.status(500).json({ message: "Server error" }); }
};

module.exports = { listNotifications, markAllRead };
