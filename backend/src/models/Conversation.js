const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Conversation = sequelize.define(
  "Conversation",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
  },
  {
    tableName: "conversations",
    timestamps: true,
  },
);

module.exports = Conversation;
