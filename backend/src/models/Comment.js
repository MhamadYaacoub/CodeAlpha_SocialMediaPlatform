const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Post = require("./Post");

const Comment = sequelize.define(
  "Comment",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    tableName: "comments",
    timestamps: true,
  },
);

User.hasMany(Comment, {
  foreignKey: "userId",
  as: "comments",
  onDelete: "CASCADE",
});

Comment.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Post.hasMany(Comment, {
  foreignKey: "postId",
  as: "comments",
  onDelete: "CASCADE",
});

Comment.belongsTo(Post, {
  foreignKey: "postId",
  as: "post",
});

module.exports = Comment;
