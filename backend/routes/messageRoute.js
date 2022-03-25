const express = require("express");
const messagesCtrl = require("../controllers/messagesCtrl");
const router = express.Router();
const auth = require("../middlewares/auth");
const multer = require("../middlewares/multer-config");

router.post("/messages/new/", auth, messagesCtrl.createMessage);
router.post("/messagesImages/new/", auth, multer, messagesCtrl.createMessageImage);
router.put("/:messageId/update", auth, multer, messagesCtrl.updateMessage);
router.get("/messages/", auth, messagesCtrl.listMessages);
router.get("/:messageId", auth, messagesCtrl.getOneMessage);
router.get("/view/:userId/messages", auth, messagesCtrl.listMessagesOtherUser);
router.get("/user/messages", auth, messagesCtrl.listMessagesUser);
router.delete("/messages/:messageId", auth, messagesCtrl.deleteMessage);
module.exports = router;
