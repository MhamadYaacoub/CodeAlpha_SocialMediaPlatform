const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Post = require("./Post");

const Like = sequelize.define(
  "Like",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },

    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Post,
        key: "id",
      },
    },
  },
  {
    tableName: "likes",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "postId"],
      },
    ],
  },
);

User.hasMany(Like, {
  foreignKey: "userId",
  as: "likes",
  onDelete: "CASCADE",
});

Like.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Post.hasMany(Like, {
  foreignKey: "postId",
  as: "likes",
  onDelete: "CASCADE",
});

Like.belongsTo(Post, {
  foreignKey: "postId",
  as: "post",
});

module.exports = Like;
