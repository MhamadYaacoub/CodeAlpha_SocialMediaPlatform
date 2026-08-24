const Notification = require("../models/Notification");

const notify = async ({ userId, actorId, type, postId = null, followRequestId = null, conversationId = null }) => {
  if (!userId || userId === actorId) return null;
  return Notification.create({ userId, actorId, type, postId, followRequestId, conversationId });
};

module.exports = { notify };
