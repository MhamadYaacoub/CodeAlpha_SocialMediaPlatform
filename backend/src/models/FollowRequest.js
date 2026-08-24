const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const FollowRequest = sequelize.define("FollowRequest", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  requesterId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: "id" } },
  targetUserId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: "id" } },
  status: { type: DataTypes.ENUM("pending", "accepted", "declined"), allowNull: false, defaultValue: "pending" },
}, { tableName: "follow_requests", timestamps: true, indexes: [{ unique: true, fields: ["requesterId", "targetUserId"] }] });

FollowRequest.belongsTo(User, { foreignKey: "requesterId", as: "requester", onDelete: "CASCADE" });
FollowRequest.belongsTo(User, { foreignKey: "targetUserId", as: "targetUser", onDelete: "CASCADE" });
module.exports = FollowRequest;
