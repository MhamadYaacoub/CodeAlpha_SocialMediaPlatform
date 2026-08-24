const { Op } = require("sequelize");
const Status = require("../models/Status");
const StatusView = require("../models/StatusView");
const User = require("../models/User");
const Follow = require("../models/Follow");

const createStatus = async (req, res) => {
  try {
    const { content, imageUrl, mediaUrl, mediaType, musicUrl, musicTitle } = req.body;

    if ((!content || !content.trim()) && !imageUrl && !mediaUrl) {
      return res.status(400).json({
        message: "Status must contain text or an image",
      });
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const status = await Status.create({
      content: content || null,
      imageUrl: imageUrl || null,
      mediaUrl: mediaUrl || imageUrl || null,
      mediaType: mediaType || (imageUrl ? "image" : null),
      musicUrl: musicUrl || null,
      musicTitle: musicTitle || null,
      userId: req.user.id,
      expiresAt,
    });

    return res.status(201).json({
      message: "Status created successfully",
      status,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getActiveStatuses = async (req, res) => {
  try {
    const followedUsers = await Follow.findAll({
      where: { followerId: req.user.id },
      attributes: ["followingId"],
    });
    const visibleUserIds = [
      req.user.id,
      ...followedUsers.map((follow) => follow.followingId),
    ];

    const statuses = await Status.findAll({
      where: {
        userId: { [Op.in]: visibleUserIds },
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },

      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "username", "profileImage"],
        },
        {
          model: StatusView,
          as: "views",
          attributes: ["id", "userId", "createdAt"],
        },
      ],

      order: [["createdAt", "DESC"]],
    });

    const result = statuses.map((status) => {
      const data = status.toJSON();

      return {
        ...data,
        viewsCount: data.views.length,
        viewed: data.views.some((view) => view.userId === req.user.id),
      };
    }).sort((a, b) => Number(a.viewed) - Number(b.viewed) || new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      statuses: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const viewStatus = async (req, res) => {
  try {
    const status = await Status.findByPk(req.params.statusId, {
      include: [{ model: User, as: "user", attributes: ["id", "name", "username", "profileImage"] }],
    });

    if (!status) {
      return res.status(404).json({
        message: "Status not found",
      });
    }

    if (new Date(status.expiresAt) <= new Date()) {
      return res.status(410).json({
        message: "Status has expired",
      });
    }

    // Don't count the owner viewing their own status
    if (status.userId !== req.user.id) {
      await StatusView.findOrCreate({
        where: {
          statusId: status.id,
          userId: req.user.id,
        },
      });
    }

    const viewsCount = await StatusView.count({
      where: {
        statusId: status.id,
      },
    });

    return res.json({
      status,
      viewsCount,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getStatusViewers = async (req, res) => {
  try {
    const status = await Status.findByPk(req.params.statusId);

    if (!status) {
      return res.status(404).json({
        message: "Status not found",
      });
    }

    if (status.userId !== req.user.id) {
      return res.status(403).json({
        message: "Only the status owner can see viewers",
      });
    }

    const views = await StatusView.findAll({
      where: {
        statusId: status.id,
      },

      include: [
        {
          model: User,
          as: "viewer",
          attributes: ["id", "name", "username", "profileImage"],
        },
      ],

      order: [["createdAt", "DESC"]],
    });

    return res.json({
      viewsCount: views.length,
      viewers: views,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const deleteStatus = async (req, res) => {
  try {
    const status = await Status.findByPk(req.params.statusId);

    if (!status) {
      return res.status(404).json({
        message: "Status not found",
      });
    }

    if (status.userId !== req.user.id) {
      return res.status(403).json({
        message: "You cannot delete this status",
      });
    }

    await status.destroy();

    return res.json({
      message: "Status deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createStatus,
  getActiveStatuses,
  viewStatus,
  getStatusViewers,
  deleteStatus,
};
