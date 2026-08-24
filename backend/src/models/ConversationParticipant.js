const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Conversation = require("./Conversation");
const User = require("./User");

const ConversationParticipant = sequelize.define(
  "ConversationParticipant",
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
    tableName: "conversation_participants",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["conversationId", "userId"],
      },
    ],
  },
);

Conversation.hasMany(ConversationParticipant, {
  foreignKey: "conversationId",
  as: "participants",
  onDelete: "CASCADE",
});

ConversationParticipant.belongsTo(Conversation, {
  foreignKey: "conversationId",
  as: "conversation",
});

User.hasMany(ConversationParticipant, {
  foreignKey: "userId",
  as: "conversationMemberships",
  onDelete: "CASCADE",
});

ConversationParticipant.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

module.exports = ConversationParticipant;
