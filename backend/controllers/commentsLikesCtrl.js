// Imports
const models = require("../models");
const jwt = require("jsonwebtoken");
const asyncLib = require("async");

// Routes
module.exports = {
  commentLikePost: function (req, res) {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN);
    const userId = decodedToken.userId;

    // Paramètres
    const commentId = parseInt(req.params.commentId);

    if (commentId <= 0) {
      return res.status(400).json({ error: "paramètres invalide" });
    }

    asyncLib.waterfall([
      function (done) {
        // on cherche la publication rapport à son id
        models.Comment.findOne({
          where: { id: commentId },
        })
          .then(function (commentFound) {
            done(null, commentFound);
          })
          .catch(function (err) {
            return res.status(500).json({ error: "impossible de vérifier la publication" });
          });
      },
      function (commentFound, done) {
        // on cherche l'utilisateur rapport à son id
        if (commentFound) {
          models.User.findOne({
            where: { id: userId },
          })
            .then(function (userFound) {
              done(null, commentFound, userFound);
            })
            .catch(function (err) {
              return res.status(500).json({ error: "impossible de vérifier l'utilisateur" });
            });
        } else {
          return res.status(404).json({ error: "publication déjà liké" });
        }
      },
      function (commentFound, userFound, done) {
        // si le user et le message sont présents dans la table like
        if (userFound) {
          models.CommentsLike.findOne({
            where: {
              userId: userId,
              commentId: commentId,
            },
          })
            .then(function (userAlreadyLikedFound) {
              done(null, commentFound, userFound, userAlreadyLikedFound);
            })
            .catch(function (err) {
              return res.status(500).json({
                error: "impossible de vérifier si l'utilisateur à déjà liké",
              });
            });
        } else {
          return res.status(404).json({ error: "l'utilisateur n'existe pas" });
        }
      },
      function (commentFound, userFound, userAlreadyLikedFound, done) {
        // si l'user n'est pas présent dans la table like on l'a crée
        if (!userAlreadyLikedFound) {
          models.CommentsLike.create({
            userLike: true,
            userDislike: false,
            commentId,
            userId,
          }),
            commentFound
              .update({
                commentLikes: commentFound.commentLikes + 1,
              })
              .then(function (alreadyLikeFound) {
                done(null, commentFound, userFound);
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
              commentFound
                .update({
                  commentLikes: commentFound.commentLikes + 1,
                })
                .then(function () {
                  done(null, commentFound, userFound);
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
              commentFound
                .update({
                  commentLikes: commentFound.commentLikes + 1,
                  commentDislikes: commentFound.commentDislikes - 1, // = messageFound.dislikes -1
                })
                .then(function () {
                  done(null, commentFound, userFound);
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
              commentFound
                .update({
                  commentLikes: commentFound.commentLikes - 1, //=  messageFound.likes - 1,
                })
                .then(function () {
                  done(null, commentFound, userFound);
                  return res.status(201).json("like retiré");
                })
                .catch(function (err) {
                  return res.status(500).json({ error: "impossible de retiré le like" });
                });
          } else {
            return res.status(409).json({ error: "publication déjà liké" });
          }
        }
      },
    ]);
  },
  commentDislikePost: function (req, res) {
    // Getting auth header
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN);
    const userId = decodedToken.userId;

    // Paramètres
    const commentId = parseInt(req.params.commentId);

    if (commentId <= 0) {
      return res.status(400).json({ error: "paramètres invalide" });
    }

    asyncLib.waterfall([
      function (done) {
        models.Comment.findOne({
          where: { id: commentId },
        })
          .then(function (commentFound) {
            done(null, commentFound);
          })
          .catch(function (err) {
            return res.status(500).json({ error: "impossible de vérifier la publication" });
          });
      },
      function (commentFound, done) {
        if (commentFound) {
          models.User.findOne({
            where: { id: userId },
          })
            .then(function (userFound) {
              done(null, commentFound, userFound);
            })
            .catch(function (err) {
              return res.status(500).json({ error: "impossible de vérifier l'utilisateur" });
            });
        } else {
          res.status(404).json({ error: "publication déjà disliké" });
        }
      },
      function (commentFound, userFound, done) {
        if (userFound) {
          models.CommentsLike.findOne({
            where: {
              userId: userId,
              commentId: commentId,
            },
          })
            .then(function (userAlreadyLikedFound) {
              done(null, commentFound, userFound, userAlreadyLikedFound);
            })
            .catch(function (err) {
              return res.status(500).json({
                error: "impossible de vérifier si l'utilisateur a déjà disliké",
              });
            });
        } else {
          res.status(404).json({ error: "l'utilisateur n'existe pas" });
        }
      },
      function (commentFound, userFound, userAlreadyLikedFound, done) {
        if (!userAlreadyLikedFound) {
          models.CommentsLike.create({
            userLike: false,
            userDislike: true,
            commentId,
            userId,
          }),
            commentFound
              .update({
                commentDislikes: commentFound.commentDislikes + 1,
              })
              .then(function (alreadyLikeFound) {
                done(null, commentFound, userFound);
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
              commentFound
                .update({
                  commentDislikes: commentFound.commentDislikes + 1,
                })
                .then(function () {
                  done(null, commentFound, userFound);
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
              commentFound
                .update({
                  commentDislikes: commentFound.commentDislikes + 1,
                  commentLikes: commentFound.commentLikes - 1, // = messageFound.likes -1
                })
                .then(function () {
                  done(null, commentFound, userFound);
                  res.status(201).json("like retiré, dislike ajouté");
                })
                .catch(function (err) {
                  res.status(500).json({ error: "impossible d'ajouter le dislike" });
                });
          } else if (userAlreadyLikedFound.userLike === false && userAlreadyLikedFound.userDislike === true) {
            userAlreadyLikedFound.update({
              userDislike: false,
            }),
              commentFound
                .update({
                  commentDislikes: commentFound.commentDislikes - 1, // =  messageFound.dislikes - 1,
                })
                .then(function () {
                  done(null, commentFound, userFound);
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
