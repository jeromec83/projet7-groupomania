const express = require("express");
const router = express.Router();
const usersCtrl = require("../controllers/usersCtrl");
const auth = require("../middlewares/auth");

// Users routes
router.post("/users/registrer/", usersCtrl.registrer);
router.post("/users/login/", usersCtrl.login);
router.get("/users/profile/", auth, usersCtrl.getUserProfile);
router.get("/:userId/profile/", auth, usersCtrl.getOtherUserProfile);
router.get("/all/users/", auth, usersCtrl.getAllOtherUser);
router.put("/users/profile/", auth, usersCtrl.updateUserProfile);
router.put("/users/firstname/", auth, usersCtrl.updateFirstname);
router.put("/users/lastname/", auth, usersCtrl.updateLastname);
router.put("/users/email/", auth, usersCtrl.updateEmail);
router.put("/users/password/", auth, usersCtrl.updatePassword);
router.put("/users/:id", auth, usersCtrl.giveAdminOtherUser);
router.delete("/user/:id", auth, usersCtrl.deleteUser);
module.exports = router;
