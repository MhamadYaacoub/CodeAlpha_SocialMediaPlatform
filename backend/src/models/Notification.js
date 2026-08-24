const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Post = require("./Post");

const Notification = sequelize.define("Notification", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: "id" } },
  actorId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: "id" } },
  type: { type: DataTypes.ENUM("like", "comment", "follow_request", "follow_accepted", "message"), allowNull: false },
  postId: { type: DataTypes.INTEGER, allowNull: true, references: { model: Post, key: "id" } },
  followRequestId: { type: DataTypes.INTEGER, allowNull: true },
  conversationId: { type: DataTypes.INTEGER, allowNull: true },
  readAt: { type: DataTypes.DATE, allowNull: true },
}, { tableName: "notifications", timestamps: true });

Notification.belongsTo(User, { foreignKey: "actorId", as: "actor", onDelete: "CASCADE" });
Notification.belongsTo(User, { foreignKey: "userId", as: "recipient", onDelete: "CASCADE" });
Notification.belongsTo(Post, { foreignKey: "postId", as: "post" });
module.exports = Notification;
