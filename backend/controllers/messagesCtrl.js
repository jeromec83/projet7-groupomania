// Imports
const models = require("../models");
const asyncLib = require("async");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const moment = require("moment"); // pour formater les dates et heures
moment.locale("fr");

// Constantes
const title_limit = 2;
const content_limit = 4;
const items_limit = 50;

module.exports = {
  createMessageImage: function (req, res) {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN); // lien avec fichier .env
    const userId = decodedToken.userId;

    // Paramètres
    const formMessage = JSON.parse(req.body.message);

    const { title, content } = formMessage;

    if (!title) {
      return res.status(400).json({ error: "champ(s) manquant(s)" });
    }

    if (title.length <= title_limit) {
      return res.status(400).json({ error: "publication insuffisante" });
    }

    asyncLib.waterfall(
      [
        function (done) {
          models.User.findOne({
            where: { id: userId },
          })
            .then(function (userFound) {
              done(null, userFound);
            })
            .catch(function (err) {
              return res.status(500).json({ error: "vérification utilisateur impossible" });
            });
        },
        function (userFound, done) {
          if (userFound) {
            models.Message.create({
              title: title,
              content: content,
              likes: 0,
              dislikes: 0,
              UserId: userFound.id,
              comments: 0,
              attachment: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
            }).then(function (newMessage) {
              done(newMessage);
            });
          } else {
            res.status(404).json({ error: "utilisateur introuvable" });
          }
        },
      ],
      function (newMessage) {
        if (newMessage) {
          var fields = req.query.fields;
          var limit = parseInt(req.query.limit);
          var offset = parseInt(req.query.offset);
          var order = req.query.order;
          models.Message.findAll({
            order: [order != null ? order.split(":") : ["createdAt", "DESC"]],
            attributes: fields !== "*" && fields != null ? fields.split(",") : null,
            limit: !isNaN(limit) ? limit : null,
            offset: !isNaN(offset) ? offset : null,
            include: [
              {
                model: models.User,
                attributes: ["firstname", "lastname", "avatar"],
              },
            ],
          }).then(function (allMessageFound) {
            const allMessageFoundParsed = JSON.parse(JSON.stringify(allMessageFound));

            if (allMessageFound) {
              const messagesFormated = allMessageFoundParsed.map((element) => {
                /*const date = moment(element.createdAt).local().format("LL");
                const hour = moment(element.createdAt).local().format("LT");
                element.createdAt = `Le ${date} à ${hour}`;
                */
                const postedDate = moment(element.createdAt).local().format("MMMM Do YYYY, h:mm:ss a");
                element.createdAt = postedDate;

                const updatedDate = moment(element.updatedAt).local().format("MMMM Do YYYY, h:mm:ss a");
                element.updatedAt = updatedDate;
                return element;
              });
              return res.status(201).json(messagesFormated);
            }
          });
        } else {
          return res.status(500).json({ error: "impossible de poster le message" });
        }
      }
    );
  },
  createMessage: function (req, res) {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN); // lien avec fichier .env
    const userId = decodedToken.userId;

    // Paramètres
    const title = req.body.title;
    const content = req.body.content;

    if (!title || !content) {
      return res.status(400).json({ error: "champ(s) manquant(s)" });
    }

    if (title.length <= title_limit || content.length <= content_limit) {
      return res.status(400).json({ error: "publication insuffisante" });
    }

    asyncLib.waterfall(
      [
        function (done) {
          models.User.findOne({
            where: { id: userId },
          })
            .then(function (userFound) {
              done(null, userFound);
            })
            .catch(function (err) {
              return res.status(500).json({ error: "vérification utilisateur impossible" });
            });
        },
        function (userFound, done) {
          if (userFound) {
            models.Message.create({
              title: title,
              content: content,
              likes: 0,
              dislikes: 0,
              UserId: userFound.id,
              comments: 0,
            }).then(function (newMessage) {
              done(newMessage);
            });
          } else {
            res.status(404).json({ error: "utilisateur introuvable" });
          }
        },
      ],
      function (newMessage) {
        if (newMessage) {
          var fields = req.query.fields;
          var limit = parseInt(req.query.limit);
          var offset = parseInt(req.query.offset);
          var order = req.query.order;
          models.Message.findAll({
            order: [order != null ? order.split(":") : ["createdAt", "DESC"]],
            attributes: fields !== "*" && fields != null ? fields.split(",") : null,
            limit: !isNaN(limit) ? limit : null,
            offset: !isNaN(offset) ? offset : null,
            include: [
              {
                model: models.User,
                attributes: ["firstname", "lastname", "avatar"],
              },
            ],
          }).then(function (allMessageFound) {
            const allMessageFoundParsed = JSON.parse(JSON.stringify(allMessageFound));

            if (allMessageFound) {
              const messagesFormated = allMessageFoundParsed.map((element) => {
                /*const date = moment(element.createdAt).local().format("LL");
                const hour = moment(element.createdAt).local().format("LT");
                element.createdAt = `Le ${date} à ${hour}`;*/
                const postedDate = moment(element.createdAt).local().format("MMMM Do YYYY, h:mm:ss a");
                element.createdAt = postedDate;

                const updatedDate = moment(element.updatedAt).local().format("MMMM Do YYYY, h:mm:ss a");
                element.updatedAt = updatedDate;
                return element;
              });
              return res.status(201).json(messagesFormated);
            }
          });
        } else {
          return res.status(500).json({ error: "impossible de poster le message" });
        }
      }
    );
  },
  listMessages: function (req, res) {
    const fields = req.query.fields;
    const limit = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);
    const order = req.query.order;

    if (limit > items_limit) {
      limit = items_limit;
    }

    models.Message.findAll({
      order: [order != null ? order.split(":") : ["createdAt", "DESC"]],
      attributes: fields !== "*" && fields != null ? fields.split(",") : null,
      limit: !isNaN(limit) ? limit : null, // mettre une limite pour éviter de trop charger, new call après la limite fixer en number
      offset: !isNaN(offset) ? offset : null,
      include: [
        {
          model: models.User,
          attributes: ["firstname", "lastname", "avatar", "isAdmin"],
        },
        {
          model: models.Like,
        },
      ],
    })
      .then(function (messages) {
        const messagesParsed = JSON.parse(JSON.stringify(messages));
        /*console.log("-----------------messagesRecus-------------------");
        console.log(test[0].createdAt);
        console.log("------------------------------------");
        console.log("------------------------------------");
        console.log(moment(test[0].createdAt).local().format("DD MM YYYY hh:mm:ss"));
        console.log("------------------------------------");
        console.log("------------------------------------");
        console.log(moment(test[0].createdAt).local().format("DD MM YYYY hh:mm:ss"));
        console.log("------------------------------------");*/
        if (messages) {
          const messagesFormated = messagesParsed.map((element) => {
            /*const date = moment(element.createdAt).local().format("LL");
            const hour = moment(element.createdAt).local().format("LT");
            element.createdAt = `Le ${date} à ${hour}`;*/
            const postedDate = moment(element.createdAt).local().format("MMMM Do YYYY, h:mm:ss a");
            element.createdAt = postedDate;

            const updatedDate = moment(element.updatedAt).local().format("MMMM Do YYYY, h:mm:ss a");
            element.updatedAt = updatedDate;
            return element;
          });
          res.status(200).json(messagesFormated);
        } else {
          res.status(404).json({ error: "message(s) introuvable(s)" });
        }
      })
      .catch(function (err) {
        console.log(err);
        res.status(500).json({ error: "colonne invalide" });
      });
  },
  listMessagesOtherUser: function (req, res) {
    const userId = req.params.userId;
    const fields = req.query.fields;
    const limit = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);
    const order = req.query.order;

    const items_limit = 50;
    if (limit > items_limit) {
      limit = items_limit;
    }

    models.Message.findAll({
      where: { userId: userId },
      order: [order != null ? order.split(":") : ["createdAt", "DESC"]],
      attributes: fields !== "*" && fields != null ? fields.split(",") : null,
      limit: !isNaN(limit) ? limit : null,
      offset: !isNaN(offset) ? offset : null,
      include: [
        {
          model: models.User,
          attributes: ["firstname", "lastname", "avatar", "isAdmin"],
        },
      ],
    })
      .then(function (messages) {
        const messagesParsed = JSON.parse(JSON.stringify(messages));
        if (messages) {
          const messagesFormated = messagesParsed.map((element) => {
            /*const date = moment(element.createdAt).local().format("LL");
            const hour = moment(element.createdAt).local().format("LT");
            element.createdAt = `Le ${date} à ${hour}`;*/
            const postedDate = moment(element.createdAt).local().format("MMMM Do YYYY, h:mm:ss a");
            element.createdAt = postedDate;

            const updatedDate = moment(element.updatedAt).local().format("MMMM Do YYYY, h:mm:ss a");
            element.updatedAt = updatedDate;
            return element;
          });
          res.status(200).json(messagesFormated);
        } else {
          res.status(404).json({ error: "publication(s) introuvable(s)" });
        }
      })
      .catch(function (err) {
        console.log(err);
        res.status(500).json({ error: "colonne invalide" });
      });
  },
  listMessagesUser: function (req, res) {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN);
    const userId = decodedToken.userId;

    const fields = req.query.fields;
    const limit = parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);
    const order = req.query.order;

    if (limit > items_limit) {
      limit = items_limit;
    }

    models.Message.findAll({
      where: { userId },
      order: [order != null ? order.split(":") : ["createdAt", "DESC"]],
      attributes: fields !== "*" && fields != null ? fields.split(",") : null,
      limit: !isNaN(limit) ? limit : null,
      offset: !isNaN(offset) ? offset : null,
      include: [
        {
          model: models.User,
          attributes: ["firstname", "lastname", "avatar", "isAdmin"],
        },
      ],
    })
      .then(function (messages) {
        const messagesParsed = JSON.parse(JSON.stringify(messages));
        if (messages) {
          const messagesFormated = messagesParsed.map((element) => {
            /*const date = moment(element.createdAt).local().format("LL");
            const hour = moment(element.createdAt).local().format("LT");
            element.createdAt = `Le ${date} à ${hour}`;*/
            const postedDate = moment(element.createdAt).local().format("MMMM Do YYYY, h:mm:ss a");
            element.createdAt = postedDate;

            const updatedDate = moment(element.updatedAt).local().format("MMMM Do YYYY, h:mm:ss a");
            element.updatedAt = updatedDate;
            return element;
          });
          res.status(200).json(messagesFormated);
        } else {
          res.status(404).json({ error: "publication(s) introuvable(s)" });
        }
      })
      .catch(function (err) {
        console.log(err);
        res.status(500).json({ error: "colonne invalide" });
      });
  },
  getOneMessage: function (req, res) {
    const messageId = parseInt(req.params.messageId);
    models.Message.findOne({
      attributes: ["createdAt", "title", "attachment", "content"],
      where: { id: messageId },
      include: [
        {
          model: models.User,
          attributes: ["firstname", "lastname"],
        },
      ],
    })
      .then(function (message) {
        if (message) {
          res.status(201).json(message);
        } else {
          res.status(404).json({ error: "publication introuvable" });
        }
      })
      .catch(function (err) {
        res.status(500).json({ error: "impossible de récupérer la publication" });
      });
  },
  updateMessage: function (req, res) {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN); // lien avec fichier .env
    const userId = decodedToken.userId;

    const messageId = parseInt(req.params.messageId);
    const formMessage = JSON.parse(req.body.message);
    const title = formMessage.title;
    const content = formMessage.content;

    asyncLib.waterfall(
      [
        function (done) {
          models.Message.findOne({
            where: { id: messageId },
          })
            .then(function (messageFound) {
              done(null, messageFound);
            })
            .catch(function (err) {
              return res.status(500).json({ error: "publication introuvable" });
            });
        },
        function (messageFound, done) {
          models.User.findOne({
            where: { id: userId },
          })
            .then(function (userFound) {
              done(null, messageFound, userFound);
            })
            .catch(function (err) {
              return res.status(500).json({ error: "vérification utilisateur impossible" });
            });
        },
        function (messageFound, userFound, done) {
          models.User.findOne({
            where: { isAdmin: true, id: userId },
          })
            .then(function (userFoundAdmin) {
              done(null, messageFound, userFound, userFoundAdmin);
            })
            .catch(function (err) {
              return res.status(500).json({ error: "vérification utilisateur impossible" });
            });
        },
        function (messageFound, userFound, userFoundAdmin, done) {
          if (messageFound) {
            if (messageFound.UserId === userFound.id || (userFoundAdmin.isAdmin && userFoundAdmin.id === userId)) {
              if (req.file) {
                messageFound
                  .update({
                    title: title ? title : messageFound.title,
                    content,
                    attachment: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
                  })
                  .then(function (newMessageFound) {
                    done(newMessageFound);
                  });
              } else {
                messageFound
                  .update({
                    title: title ? title : messageFound.title,
                    content: content ? content : messageFound.content,
                  })
                  .then(function (newMessageFound) {
                    done(newMessageFound);
                  });
              }
            } else {
              res.status(404).json({ error: "cette publication ne vous appartient guère" });
            }
          } else {
            res.status(404).json({ error: "utilisateur introuvable" });
          }
        },
      ],
      function (messageFound) {
        if (messageFound) {
          return res.status(201).json(messageFound);
        } else {
          return res.status(500).json({ error: "impossible de poster la modification" });
        }
      }
    );
  },
  deleteMessage: function (req, res) {
    //Params
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN);
    const userId = decodedToken.userId;
    const messageId = parseInt(req.params.messageId);

    asyncLib.waterfall([
      function (done) {
        models.Comment.findAll({
          where: { messageId },
          attributes: ["id"],
        })
          .then(function (commentsFound) {
            let commentIds = [];

            commentsFound.map(({ id }) => {
              commentIds.push(id);
            });
            done(null, commentIds);
          })
          .catch(function (err) {
            res.status(500).json({ error: "vérification commentaire impossible" });
          });
      },
      function (commentIds, done) {
        models.CommentsLike.destroy({
          where: { commentId: commentIds },
        })
          .then(function () {
            done(null);
          })
          .catch(function (err) {
            res.status(500).json({ error: "impossible de supprimer les commentaires like" });
          });
      },
      function (done) {
        models.Comment.destroy({
          where: { messageId: messageId },
        })
          .then(() => {
            models.Like.destroy({
              where: { messageId: messageId },
            });
            done(null);
          })
          .catch((err) => {
            return res.status(500).json({ error: "impossible de supprimer les commentaires" });
          });
      },
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
        models.User.findOne({
          where: { isAdmin: true, id: userId },
        })
          .then(function (userFoundAdmin) {
            done(null, messageFound, userFoundAdmin);
          })
          .catch(function (err) {
            res.status(500).json({ error: "impossible de véifier l'utilisateur" });
          });
      },
      function (messageFound, userFoundAdmin, done) {
        if (messageFound.UserId === userId || (userFoundAdmin.isAdmin === true && userFoundAdmin.id === userId)) {
          if (messageFound.attachment === null) {
            messageFound
              .destroy({
                where: { id: messageId },
              })
              .then(function (destroyMessageFound) {
                return res.status(201).json(destroyMessageFound);
              })
              .catch(function (err) {
                res.status(500).json({ error: "impossible de supprimer la publication" });
              });
          } else {
            const filename = messageFound.attachment.split("/images/")[1];
            fs.unlink(`images/${filename}`, (err) => {
              if (err) return res.status(500).json({ error: "impossible de supprimer la publication" });
              messageFound
                .destroy({
                  where: { id: messageId },
                })
                .then((destroyMessageFoundImg) => {
                  return res.status(201).json(destroyMessageFoundImg);
                });
            });
          }
        } else return res.status(500).json({ error: "la publication ne vous appartient pas" });
      },
    ]);
  },
};
