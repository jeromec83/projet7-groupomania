const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const commentsCtrl = require("../controllers/commentsCtrl");

router.post("/:messageId/comments/new/", auth, commentsCtrl.createComment);
router.get("/:messageId/comments", auth, commentsCtrl.listComments);
router.put("/:commentId/comment/update", auth, commentsCtrl.updateComment);
router.delete("/user/:messageId/:commentId", auth, commentsCtrl.deleteComment);
module.exports = router;
