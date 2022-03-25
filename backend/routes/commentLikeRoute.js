const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const commentsLikesCtrl = require("../controllers/commentsLikesCtrl");

router.post("/:commentId/vote/like", auth, commentsLikesCtrl.commentLikePost);
router.post(
  "/:commentId/vote/dislike",
  auth,
  commentsLikesCtrl.commentDislikePost
);
module.exports = router;
