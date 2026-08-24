const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  startConversation,
  getMyConversations,
  sendMessage,
  getMessages,
  markMessagesAsRead,
} = require("../controllers/messageController");

const router = express.Router();

router.post("/conversations", authMiddleware, startConversation);

router.get("/conversations", authMiddleware, getMyConversations);

router.post(
  "/conversations/:conversationId/messages",
  authMiddleware,
  sendMessage,
);

router.get(
  "/conversations/:conversationId/messages",
  authMiddleware,
  getMessages,
);

router.patch(
  "/conversations/:conversationId/read",
  authMiddleware,
  markMessagesAsRead,
);

module.exports = router;
