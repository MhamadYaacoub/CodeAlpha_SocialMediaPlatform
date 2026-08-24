const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Post = sequelize.define(
  "Post",
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

    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mediaUrl: { type: DataTypes.STRING, allowNull: true },
    mediaType: { type: DataTypes.ENUM("image", "video"), allowNull: true },
    musicUrl: { type: DataTypes.STRING, allowNull: true },
    musicTitle: { type: DataTypes.STRING, allowNull: true },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    tableName: "posts",
    timestamps: true,
  },
);

User.hasMany(Post, {
  foreignKey: "userId",
  as: "posts",
  onDelete: "CASCADE",
});

Post.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

module.exports = Post;
