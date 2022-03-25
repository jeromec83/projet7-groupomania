// Imports
const models = require("../models");
const jwt = require("jsonwebtoken");
const asyncLib = require("async");

// Routes
module.exports = {
  likePost: function (req, res) {
    // Getting auth header
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN);
    const userId = decodedToken.userId;

    // Paramètres
    const messageId = parseInt(req.params.messageId);

    if (messageId <= 0) {
      return res.status(400).json({ error: "paramètres invalide" });
    }

    asyncLib.waterfall([
      function (done) {
        // on cherche la publication rapport à son id
        models.Message.findOne({
          where: { id: messageId },
        })
          .then(function (messageFound) {
            done(null, messageFound);
          })
          .catch(function (err) {
            return res.status(500).json({ error: "impossible de vérifier la publication" });
          });
      },
      function (messageFound, done) {
        // on cherche l'utilisateur rapport à son id
        if (messageFound) {
          models.User.findOne({
            where: { id: userId },
          })
            .then(function (userFound) {
              done(null, messageFound, userFound);
            })
            .catch(function (err) {
              return res.status(500).json({ error: "impossible de vérifier l'utilisateur" });
            });
        } else {
          return res.status(404).json({ error: "publication déjà liké" });
        }
      },
      function (messageFound, userFound, done) {
        // si le user et le message sont présents dans la table like
        if (userFound) {
          models.Like.findOne({
            where: {
              userId: userId,
              messageId: messageId,
            },
          })
            .then(function (userAlreadyLikedFound) {
              done(null, messageFound, userFound, userAlreadyLikedFound);
            })
            .catch(function (err) {
              return res.status(500).json({
                error: "impossible de vérifier si l'utilisateur a déjà liké",
              });
            });
        } else {
          return res.status(404).json({ error: "l'utilisateur n'existe pas" });
        }
      },
      function (messageFound, userFound, userAlreadyLikedFound, done) {
        // si l'user n'est pas présent dans la table like on l'a crée
        if (!userAlreadyLikedFound) {
          models.Like.create({
            userLike: true,
            userDislike: false,
            messageId,
            userId,
          }),
            messageFound
              .update({
                likes: messageFound.likes + 1,
              })
              .then(function (alreadyLikeFound) {
                done(null, messageFound, userFound);
                return res.status(201).json("like ajouté");
              })
              .catch(function (err) {
                return res.status(500).json({ error: "impossible d'ajouter le like" });
              });
        } else {
          // si il n'a pas déja liker et disliker
          if (!userAlreadyLikedFound.userLike && !userAlreadyLikedFound.userDislike) {
            userAlreadyLikedFound.update({
              userLike: true,
            }),
              messageFound
                .update({
                  likes: messageFound.likes + 1,
                })
                .then(function () {
                  done(null, messageFound, userFound);
                  return res.status(201).json("like ajouté");
                })
                .catch(function (err) {
                  return res.status(500).json({ error: "impossible d'ajouter le like" });
                });
            // si il a déjà disliké
          } else if (userAlreadyLikedFound.userLike === false && userAlreadyLikedFound.userDislike === true) {
            userAlreadyLikedFound.update({
              userDislike: false,
              userLike: true,
            }),
              messageFound
                .update({
                  likes: messageFound.likes + 1,
                  dislikes: messageFound.dislikes - 1, // = messageFound.dislikes -1
                })
                .then(function () {
                  done(null, messageFound, userFound);
                  return res.status(201).json("dislike retiré, like ajouté");
                })
                .catch(function (err) {
                  return res.status(500).json({ error: "impossible d'ajouter le like" });
                });
            // si il à déjà liké
          } else if (userAlreadyLikedFound.userLike === true && userAlreadyLikedFound.userDislike === false) {
            userAlreadyLikedFound.update({
              userLike: false,
            }),
              messageFound
                .update({
                  likes: messageFound.likes - 1, //=  messageFound.likes - 1,
                })
                .then(function () {
                  done(null, messageFound, userFound);
                  return res.status(201).json("like retiré");
                })
                .catch(function (err) {
                  return res.status(500).json({ error: "impossible de retirer le like" });
                });
          } else {
            return res.status(409).json({ error: "publication déjà liké" });
          }
        }
      },
    ]);
  },
  dislikePost: function (req, res) {
    // Getting auth header
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN);
    const userId = decodedToken.userId;

    // Paramètres
    const messageId = parseInt(req.params.messageId);

    if (messageId <= 0) {
      return res.status(400).json({ error: "paramètres invalide" });
    }

    asyncLib.waterfall([
      function (done) {
        models.Message.findOne({
          where: { id: messageId },
        })
          .then(function (messageFound) {
            done(null, messageFound);
          })
          .catch(function (err) {
            return res.status(500).json({ error: "impossible de vérifier la publication" });
          });
      },
      function (messageFound, done) {
        if (messageFound) {
          models.User.findOne({
            where: { id: userId },
          })
            .then(function (userFound) {
              done(null, messageFound, userFound);
            })
            .catch(function (err) {
              return res.status(500).json({ error: "impossible de vérifier l'utilisateur" });
            });
        } else {
          res.status(404).json({ error: "publication déjà disliké" });
        }
      },
      function (messageFound, userFound, done) {
        if (userFound) {
          models.Like.findOne({
            where: {
              userId: userId,
              messageId: messageId,
            },
          })
            .then(function (userAlreadyLikedFound) {
              done(null, messageFound, userFound, userAlreadyLikedFound);
            })
            .catch(function (err) {
              return res.status(500).json({
                error: "impossible de vérifier si l'utilisateur à déjà disliké",
              });
            });
        } else {
          res.status(404).json({ error: "l'utilisateur n'existe pas" });
        }
      },
      function (messageFound, userFound, userAlreadyLikedFound, done) {
        if (!userAlreadyLikedFound) {
          models.Like.create({
            userLike: false,
            userDislike: true,
            messageId,
            userId,
          }),
            messageFound
              .update({
                dislikes: messageFound.dislikes + 1,
              })
              .then(function (alreadyLikeFound) {
                done(null, messageFound, userFound);
                res.status(201).json("dislike ajouté");
              })
              .catch(function (err) {
                return res.status(500).json({ error: "impossible d'ajouter le dislike" });
              });
        } else {
          if (userAlreadyLikedFound.userLike === false && userAlreadyLikedFound.userDislike === false) {
            userAlreadyLikedFound.update({
              userDislike: true,
            }),
              messageFound
                .update({
                  dislikes: messageFound.dislikes + 1,
                })
                .then(function () {
                  done(null, messageFound, userFound);
                  res.status(201).json("dislike ajouté");
                })
                .catch(function (err) {
                  res.status(500).json({ error: "impossible d'ajouter le dislike" });
                });
          } else if (userAlreadyLikedFound.userLike === true && userAlreadyLikedFound.userDislike === false) {
            userAlreadyLikedFound.update({
              userDislike: true,
              userLike: false,
            }),
              messageFound
                .update({
                  dislikes: messageFound.dislikes + 1,
                  likes: messageFound.likes - 1, // = messageFound.likes -1
                })
                .then(function () {
                  done(null, messageFound, userFound);
                  res.status(201).json("like retiré, dislike ajouté");
                })
                .catch(function (err) {
                  res.status(500).json({ error: "impossible d'ajouter le dislike" });
                });
          } else if (userAlreadyLikedFound.userLike === false && userAlreadyLikedFound.userDislike === true) {
            userAlreadyLikedFound.update({
              userDislike: false,
            }),
              messageFound
                .update({
                  dislikes: messageFound.dislikes - 1, // =  messageFound.dislikes - 1,
                })
                .then(function () {
                  done(null, messageFound, userFound);
                  res.status(201).json("dislike retiré");
                })
                .catch(function (err) {
                  res.status(500).json({ error: "impossible de retirer le dislike" });
                });
          } else {
            res.status(409).json({ error: "publication déjà disliké" });
          }
        }
      },
    ]);
  },
};
