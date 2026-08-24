const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  toggleFollow,
  getFollowers,
  getFollowing,
  respondToFollowRequest,
} = require("../controllers/followController");

const router = express.Router();

router.post("/users/:userId/follow", authMiddleware, toggleFollow);
router.patch("/follow-requests/:requestId", authMiddleware, respondToFollowRequest);

router.get("/users/:userId/followers", getFollowers);

router.get("/users/:userId/following", getFollowing);

module.exports = router;
