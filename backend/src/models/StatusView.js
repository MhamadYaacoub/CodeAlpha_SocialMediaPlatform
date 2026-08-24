const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Status = require("./Status");

const StatusView = sequelize.define(
  "StatusView",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Status,
        key: "id",
      },
    },

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
    tableName: "status_views",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["statusId", "userId"],
      },
    ],
  },
);

Status.hasMany(StatusView, {
  foreignKey: "statusId",
  as: "views",
  onDelete: "CASCADE",
});

StatusView.belongsTo(Status, {
  foreignKey: "statusId",
  as: "status",
});

User.hasMany(StatusView, {
  foreignKey: "userId",
  as: "statusViews",
  onDelete: "CASCADE",
});

StatusView.belongsTo(User, {
  foreignKey: "userId",
  as: "viewer",
});

module.exports = StatusView;
