const { Op } = require("sequelize");

const Conversation = require("../models/Conversation");
const ConversationParticipant = require("../models/ConversationParticipant");
const Message = require("../models/Message");
const Follow = require("../models/Follow");
const User = require("../models/User");
const { notify } = require("../services/notificationService");

const areMutualFollowers = async (userA, userB) => {
  const firstFollow = await Follow.findOne({
    where: {
      followerId: userA,
      followingId: userB,
    },
  });

  const secondFollow = await Follow.findOne({
    where: {
      followerId: userB,
      followingId: userA,
    },
  });

  return Boolean(firstFollow && secondFollow);
};

const startConversation = async (req, res) => {
  const transaction = await Conversation.sequelize.transaction();

  try {
    const currentUserId = req.user.id;
    const otherUserId = Number(req.body.userId);

    if (!otherUserId) {
      await transaction.rollback();

      return res.status(400).json({
        message: "User ID is required",
      });
    }

    if (currentUserId === otherUserId) {
      await transaction.rollback();

      return res.status(400).json({
        message: "You cannot start a conversation with yourself",
      });
    }

    const otherUser = await User.findByPk(otherUserId);

    if (!otherUser) {
      await transaction.rollback();

      return res.status(404).json({
        message: "User not found",
      });
    }

    const mutual = await areMutualFollowers(currentUserId, otherUserId);

    if (!mutual) {
      await transaction.rollback();

      return res.status(403).json({
        message: "Both users must follow each other before messaging",
      });
    }

    const myMemberships = await ConversationParticipant.findAll({
      where: {
        userId: currentUserId,
      },
      attributes: ["conversationId"],
    });

    const myConversationIds = myMemberships.map((item) => item.conversationId);

    if (myConversationIds.length > 0) {
      const existingMembership = await ConversationParticipant.findOne({
        where: {
          userId: otherUserId,
          conversationId: {
            [Op.in]: myConversationIds,
          },
        },
      });

      if (existingMembership) {
        const participantCount = await ConversationParticipant.count({
          where: {
            conversationId: existingMembership.conversationId,
          },
        });

        if (participantCount === 2) {
          const existingConversation = await Conversation.findByPk(
            existingMembership.conversationId,
          );

          await transaction.rollback();

          return res.json({
            message: "Conversation already exists",
            conversation: existingConversation,
          });
        }
      }
    }

    const conversation = await Conversation.create({}, { transaction });

    await ConversationParticipant.bulkCreate(
      [
        {
          conversationId: conversation.id,
          userId: currentUserId,
        },
        {
          conversationId: conversation.id,
          userId: otherUserId,
        },
      ],
      { transaction },
    );

    await transaction.commit();

    return res.status(201).json({
      message: "Conversation created successfully",
      conversation,
    });
  } catch (error) {
    await transaction.rollback();

    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getMyConversations = async (req, res) => {
  try {
    // Keep the inbox synchronized with the current relationship graph. A mutual
    // follow should appear immediately, even before either person sends a message.
    const [outgoing, incoming] = await Promise.all([
      Follow.findAll({ where: { followerId: req.user.id }, attributes: ["followingId"] }),
      Follow.findAll({ where: { followingId: req.user.id }, attributes: ["followerId"] }),
    ]);
    const incomingIds = new Set(incoming.map((item) => item.followerId));
    const mutualIds = outgoing.map((item) => item.followingId).filter((id) => incomingIds.has(id));
    const mutualIdSet = new Set(mutualIds);

    const currentMemberships = await ConversationParticipant.findAll({
      where: { userId: req.user.id },
      attributes: ["conversationId"],
    });
    const currentConversationIds = currentMemberships.map((item) => item.conversationId);
    const connectedIds = new Set();
    if (currentConversationIds.length) {
      const connectedMemberships = await ConversationParticipant.findAll({
        where: {
          conversationId: { [Op.in]: currentConversationIds },
          userId: { [Op.in]: mutualIds.length ? mutualIds : [-1] },
        },
        attributes: ["userId"],
      });
      connectedMemberships.forEach((item) => connectedIds.add(item.userId));
    }

    for (const userId of mutualIds.filter((id) => !connectedIds.has(id))) {
      const conversation = await Conversation.create();
      await ConversationParticipant.bulkCreate([
        { conversationId: conversation.id, userId: req.user.id },
        { conversationId: conversation.id, userId },
      ]);
    }

    const memberships = await ConversationParticipant.findAll({
      where: {
        userId: req.user.id,
      },

      include: [
        {
          model: Conversation,
          as: "conversation",

          include: [
            {
              model: ConversationParticipant,
              as: "participants",

              include: [
                {
                  model: User,
                  as: "user",
                  attributes: ["id", "name", "username", "profileImage"],
                },
              ],
            },

            {
              model: Message,
              as: "messages",
              separate: true,
              limit: 1,
              order: [["createdAt", "DESC"]],
            },
          ],
        },
      ],

      order: [["updatedAt", "DESC"]],
    });

    const activeMemberships = memberships.filter((membership) => {
      const other = membership.conversation.participants.find((participant) => participant.userId !== req.user.id);
      return other && mutualIdSet.has(other.userId);
    });
    const conversations = await Promise.all(activeMemberships.map(async (membership) => {
      const conversation = membership.conversation.toJSON();
      conversation.unreadCount = await Message.count({ where: { conversationId: conversation.id, senderId: { [Op.ne]: req.user.id }, readAt: null } });
      return conversation;
    }));
    return res.json({ conversations, unreadCount: conversations.reduce((sum, item) => sum + item.unreadCount, 0) });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const conversationId = Number(req.params.conversationId);

    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Message content is required",
      });
    }

    const membership = await ConversationParticipant.findOne({
      where: {
        conversationId,
        userId: req.user.id,
      },
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not part of this conversation",
      });
    }

    const participants = await ConversationParticipant.findAll({
      where: {
        conversationId,
      },
    });

    if (participants.length !== 2) {
      return res.status(400).json({
        message: "Invalid private conversation",
      });
    }

    const otherParticipant = participants.find(
      (participant) => participant.userId !== req.user.id,
    );

    const mutual = await areMutualFollowers(
      req.user.id,
      otherParticipant.userId,
    );

    if (!mutual) {
      return res.status(403).json({
        message: "Both users must still follow each other to send messages",
      });
    }

    const message = await Message.create({
      conversationId,
      senderId: req.user.id,
      content: content.trim(),
    });
    await notify({ userId: otherParticipant.userId, actorId: req.user.id, type: "message", conversationId });

    await Conversation.update(
      {
        updatedAt: new Date(),
      },
      {
        where: {
          id: conversationId,
        },
      },
    );

    return res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const conversationId = Number(req.params.conversationId);

    const membership = await ConversationParticipant.findOne({
      where: {
        conversationId,
        userId: req.user.id,
      },
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not part of this conversation",
      });
    }

    const messages = await Message.findAll({
      where: {
        conversationId,
      },

      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name", "username", "profileImage"],
        },
      ],

      order: [["createdAt", "ASC"]],
    });

    return res.json({
      messages,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const markMessagesAsRead = async (req, res) => {
  try {
    const conversationId = Number(req.params.conversationId);

    const membership = await ConversationParticipant.findOne({
      where: {
        conversationId,
        userId: req.user.id,
      },
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not part of this conversation",
      });
    }

    await Message.update(
      {
        readAt: new Date(),
      },
      {
        where: {
          conversationId,

          senderId: {
            [Op.ne]: req.user.id,
          },

          readAt: null,
        },
      },
    );
    const Notification = require("../models/Notification");
    await Notification.update({ readAt: new Date() }, { where: { userId: req.user.id, type: "message", conversationId, readAt: null } });

    return res.json({
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  startConversation,
  getMyConversations,
  sendMessage,
  getMessages,
  markMessagesAsRead,
};
