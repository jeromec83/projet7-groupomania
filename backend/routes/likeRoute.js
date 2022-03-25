const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const likesCtrl = require("../controllers/likesCtrl");

router.post("/messages/:messageId/vote/like", auth, likesCtrl.likePost);
router.post("/messages/:messageId/vote/dislike", auth, likesCtrl.dislikePost);
module.exports = router;
