const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Follow = sequelize.define(
  "Follow",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    followerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },

    followingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    tableName: "follows",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["followerId", "followingId"],
      },
    ],
  },
);

User.belongsToMany(User, {
  through: Follow,
  as: "following",
  foreignKey: "followerId",
  otherKey: "followingId",
});

User.belongsToMany(User, {
  through: Follow,
  as: "followers",
  foreignKey: "followingId",
  otherKey: "followerId",
});

Follow.belongsTo(User, {
  foreignKey: "followerId",
  as: "follower",
});

Follow.belongsTo(User, {
  foreignKey: "followingId",
  as: "followingUser",
});

module.exports = Follow;
