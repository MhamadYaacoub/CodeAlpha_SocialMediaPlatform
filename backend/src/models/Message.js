const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Conversation = require("./Conversation");
const User = require("./User");

const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Conversation,
        key: "id",
      },
    },

    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "messages",
    timestamps: true,
  },
);

Conversation.hasMany(Message, {
  foreignKey: "conversationId",
  as: "messages",
  onDelete: "CASCADE",
});

Message.belongsTo(Conversation, {
  foreignKey: "conversationId",
  as: "conversation",
});

User.hasMany(Message, {
  foreignKey: "senderId",
  as: "sentMessages",
  onDelete: "CASCADE",
});

Message.belongsTo(User, {
  foreignKey: "senderId",
  as: "sender",
});

module.exports = Message;
