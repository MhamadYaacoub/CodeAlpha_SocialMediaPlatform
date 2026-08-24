const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Status = sequelize.define(
  "Status",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: true,
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

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "statuses",
    timestamps: true,
  },
);

User.hasMany(Status, {
  foreignKey: "userId",
  as: "statuses",
  onDelete: "CASCADE",
});

Status.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

module.exports = Status;
