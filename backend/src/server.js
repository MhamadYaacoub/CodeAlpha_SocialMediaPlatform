const http = require("http");
const { Server } = require("socket.io");
const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");
const express = require("express");
const userRoutes = require("./routes/userRoutes");
const Post = require("./models/Post");
const postRoutes = require("./routes/postRoutes");
const Comment = require("./models/Comment");
const commentRoutes = require("./routes/commentRoutes");
const Like = require("./models/Like");
const likeRoutes = require("./routes/likeRoutes");
const Follow = require("./models/Follow");
const followRoutes = require("./routes/followRoutes");
const Status = require("./models/Status");
const StatusView = require("./models/StatusView");
const statusRoutes = require("./routes/statusRoutes");
const Conversation = require("./models/Conversation");
const ConversationParticipant = require("./models/ConversationParticipant");
const Message = require("./models/Message");
const messageRoutes = require("./routes/messageRoutes");
const FollowRequest = require("./models/FollowRequest");
const Notification = require("./models/Notification");
const notificationRoutes = require("./routes/notificationRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const sequelize = require("./config/database");

const app = express();

const server = http.createServer(app);
const frontendDist = path.join(__dirname, "../../frontend/dist/frontend/browser");
const uploadDirectory = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, "../uploads");

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:4200",
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:4200" }));
app.use(express.json());
app.use("/uploads", express.static(uploadDirectory));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api", commentRoutes);
app.use("/api", likeRoutes);
app.use("/api", followRoutes);
app.use("/api", statusRoutes);
app.use("/api", messageRoutes);
app.use("/api", notificationRoutes);
app.use("/api/uploads", uploadRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Socially API",
  });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(frontendDist));
  app.get(/^(?!\/api|\/uploads).*/, (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinConversation", (conversationId) => {
    socket.join(`conversation_${conversationId}`);
  });

  socket.on("sendMessage", (data) => {
    io.to(`conversation_${data.conversationId}`).emit("newMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();

    console.log("PostgreSQL connected successfully.");

    for (const table of ["posts", "statuses"]) {
      await sequelize.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS "mediaUrl" VARCHAR(255)`);
      await sequelize.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS "mediaType" VARCHAR(20)`);
      await sequelize.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS "musicUrl" VARCHAR(255)`);
      await sequelize.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS "musicTitle" VARCHAR(255)`);
    }

    await sequelize.sync();

    console.log("Database tables synchronized.");

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to PostgreSQL:");
    console.error(error);
  }
};

startServer();
