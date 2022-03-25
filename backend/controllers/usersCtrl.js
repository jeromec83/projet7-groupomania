// Imports
const bcrypt = require("bcrypt");
const models = require("../models");
const jwt = require("jsonwebtoken");
const asyncLib = require("async");
const fs = require("fs");

// Constantes
const email_regex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const password_regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/;
const name_regex = /^([A-zàâäçéèêëîïôùûüÿæœÀÂÄÇÉÈÊËÎÏÔÙÛÜŸÆŒ-]* ?[A-zàâäçéèêëîïôùûüÿæœÀÂÄÇÉÈÊËÎÏÔÙÛÜŸÆŒ]+$)$/;
module.exports = {
  registrer: function (req, res) {
    // Paramètres
    let { email, firstname, lastname, password, confirmPassword, bio } = req.body;
    const avatar = "/static/media/1.589279a0.jpg";

    if (!email || !firstname || !lastname || !password) {
      return res.status(400).json({ error: "champ(s) manquant(s)" });
    }
    // .trim supprime les espaces
    email = email.trim();
    firstname = firstname.trim();
    lastname = lastname.trim();
    bio = bio.trim();
    // verifier la longueur pseudo, mail regex, password etc
    if (firstname.length >= 25 || firstname === 1) {
      return res.status(400).json({ error: "champ(s) manquant(s)" });
    }
    if (lastname.length >= 25 || lastname === 1) {
      return res.status(400).json({ error: "champ(s) manquant(s)" });
    }
    if (!email_regex.test(email)) {
      return res.status(400).json({ error: "e-mail non valide" });
    }
    if (!name_regex.test(firstname)) {
      return res.status(400).json({ error: "Prénom non valide" });
    }

    if (!name_regex.test(lastname)) {
      return res.status(400).json({ error: "NOM non valide" });
    }

    if (!password_regex.test(password)) {
      return res.status(400).json({
        error:
          "mot de passe non valide, 8 caractères minimum, contenant au moins une lettre minuscule, une lettre majuscule, un chiffre numérique et un caractère spécial",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "vous n'avez pas saisie le même mot de passe" });
    }

    
    

    asyncLib.waterfall(
      [
        function (done) {
          models.User.findOne({
            attributes: ["email"],
            where: { email: email },
          })
            // passe dans le then avec done qui sert de callback, le paramètre null signifie qu'on souhaite passer à la suite
            // on applique le paramètre userFound car on en a besoin dans la fonction suivante
            .then(function (userFound) {
              done(null, userFound);
            })
            .catch(function (err) {
              return res.status(500).json({ error: "vérification utilisateur impossible" });
            });
        },
        // si utilisateur n'est pas existant, on utilise bcrypt pour hasher le password
        // dans le cas contraire on renvoit une erreur
        function (userFound, done) {
          if (!userFound) {
            bcrypt.hash(password, 5, function (err, bcryptedPassword) {
              done(null, userFound, bcryptedPassword);
            });
          } else {
            return res.status(409).json({ error: "e-mail déjà existant" });
          }
        },
        function (userFound, bcryptedPassword, done) {
          models.User.findOne({
            attributes: ["firstname"],
            where: { firstname },
          })
            .then(function (firstnameFound) {
              done(null, userFound, bcryptedPassword, firstnameFound);
            })
            .catch(function (err) {
              return res.status(500).json({ error: "vérification utilisateur impossible" });
            });
        },
        function (userFound, bcryptedPassword, firstnameFound, done) {
          models.User.findOne({
            attributes: ["lastname"],
            where: { lastname },
          })
            .then(function (lastnameFound) {
              done(null, userFound, bcryptedPassword, firstnameFound, lastnameFound);
            })
            .catch(function (err) {
              return res.status(500).json({ error: "2 vérification utilisateur impossible" });
            });
        },
        function (userFound, bcryptedPassword, firstnameFound, lastnameFound, done) {
          if (!firstnameFound) {
            done(null, userFound, bcryptedPassword, firstnameFound, lastnameFound);
          } else {
            return res.status(409).json({ error: "Pseudonyme déjà existant" });
          }
        },
        // si mot de passe hasher, on crée un nouvel utilisateur
        function (userFound, bcryptedPassword, firstnameFound, lastnameFound, done) {
          const newUser = models.User.create({
            email: email,
            firstname: firstname,
            lastname: lastname,
            password: bcryptedPassword,
            bio: bio,
            avatar: avatar,
            isAdmin: 0,
          })
            .then(function (newUser) {
              done(newUser);
            })
            .catch(function (err) {
              return res.status(500).json({ error: "ajout utilisateur impossible" });
            });
        },
      ],
      // on vérifie si l'argument newUser existe, si c'est le cas on renvoie comme quoi il a été créé
      function (newUser) {
        if (newUser) {
          return res.status(201).json({
            userId: newUser.id,
            token: jwt.sign({ userId: newUser.id, isAdmin: newUser.isAdmin }, process.env.TOKEN, { expiresIn: "24h" }),
          });
        } else {
          return res.status(500).json({ error: "ajout utilisateur impossible" });
        }
      }
    );
  },
  login: function (req, res) {
    // Paramètres
    const email = req.body.email;
    const password = req.body.password;

    if (email == null || password == null) {
      return res.status(400).json({ error: "champ(s) manquant(s)" });
    }

    asyncLib.waterfall(
      [
        function (done) {
          models.User.findOne({
            where: { email: email },
          })
            .then(function (userFound) {
              done(null, userFound);
            })
            .catch(function (err) {
              return res.status(500).json({ error: "vérification utilisateur impossible" });
            });
        },
        // si utilisateur trouvé via son mail, on compare le mot de passe
        function (userFound, done) {
          if (userFound) {
            bcrypt.compare(password, userFound.password, function (errBycrypt, resBycrypt) {
              done(null, userFound, resBycrypt);
            });
          } else {
            return res.status(404).json({ error: "utilisateur absent de la base de donnée" });
          }
        },
        // si le mot de passe est décodé, c'est bien le bon utilisateur
        function (userFound, resBycrypt, done) {
          if (resBycrypt) {
            done(userFound);
          } else {
            return res.status(403).json({ error: "mot de passe invalide" });
          }
        },
      ],
      // si le bon utilisateur on affiche son id et on lui attribut un token pour la session
      function (userFound) {
        if (userFound) {
          return res.status(201).json({
            userId: userFound.id,
            firstname: userFound.firstname,
            lastname: userFound.lastname,
            token: jwt.sign(
              {
                userId: userFound.id,
                isAdmin: userFound.isAdmin,
              },
              process.env.TOKEN,
              { expiresIn: "24h" }
            ),
          });
        } else {
          return res.status(500).json({ error: "login utilisateur impossible" });
        }
      }
    );
  },
  getUserProfile: function (req, res) {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN); // lien avec fichier .env
    const userId = decodedToken.userId;

    models.User.findOne({
      attributes: ["id", "email", "firstname", "lastname", "bio", "avatar", "isAdmin"],
      where: { id: userId },
    })
      .then(function (user) {
        if (user) {
          res.status(201).json(user);
        } else {
          res.status(404).json({ error: "utilisateur introuvable" });
        }
      })
      .catch(function (err) {
        res.status(500).json({ error: "impossible de récupérer l'utilisateur" });
      });
  },
  getOtherUserProfile: function (req, res) {
    /*const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN);
    const userId = decodedToken.userId;*/

    models.User.findByPk(req.params.userId, { attributes: ["firstname", "lastname", "bio", "avatar", "isAdmin"] })
      .then(function (user) {
        if (user) {
          res.status(201).json(user);
        } else {
          res.status(404).json({ error: "utilisateur introuvable" });
        }
      })
      .catch(function (err) {
        res.status(500).json({ error: "impossible de récupérer l'utilisateur" });
      });
  },
  getAllOtherUser: function (req, res) {
    const order = req.query.order;

    models.User.findAll({
      order: [order != null ? order.split(":") : ["createdAt", "DESC"]],
      attributes: ["id", "firstname", "lastname", "avatar", "isAdmin"],
    })
      .then(function (user) {
        if (user) {
          res.status(201).json(user);
        } else {
          res.status(404).json({ error: "utilisateurs introuvable" });
        }
      })
      .catch(function (err) {
        res.status(500).json({ error: "impossible de récupérer les utilisateurs" });
      });
  },
  updateUserProfile: function (req, res) {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN); // lien avec fichier .env
    const userId = decodedToken.userId;

    // Paramètres
    const bio = req.body.bio;
    const avatar = req.body.avatar;

    asyncLib.waterfall(
      [
        // récupère l'utilisateur dans la DBase
        function (done) {
          models.User.findOne({
            //attributes: ["id", "bio"],
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
            userFound
              .update({
                bio: bio ? bio : userFound.bio,
                avatar: avatar ? avatar : userFound.avatar,
              })
              .then(function () {
                done(userFound);
              })
              .catch(function (err) {
                res.status(500).json({ error: "mise à jour utilisateur impossible" });
              });
          } else {
            res.status(404).json({ error: "utilisateur introuvable" });
          }
        },
      ],
      function (userFound) {
        if (userFound) {
          return res.status(201).json(userFound);
        } else {
          return res.status(500).json({ error: "mise à jour du profil utilisateur impossible" });
        }
      }
    );
  },

  updateFirstname: function (req, res) {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN); // lien avec fichier .env
    const userId = decodedToken.userId;

    // Paramètres
    const firstname = req.body.firstname;

    if (!name_regex.test(firstname)) {
      return res.status(400).json({ error: "Prénom non valide" });
    }
    asyncLib.waterfall(
      [
        // récupère l'utilisateur dans la DBase
        function (done) {
          models.User.findOne({
            //attributes: ["id", "bio"],
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
            userFound
              .update({
                firstname: firstname ? firstname : userFound.firstname,
              })
              .then(function () {
                done(userFound);
              })
              .catch(function (err) {
                res.status(500).json({ error: "mise à jour utilisateur impossible" });
              });
          } else {
            res.status(404).json({ error: "utilisateur introuvable" });
          }
        },
      ],
      function (userFound) {
        if (userFound) {
          return res.status(201).json(userFound);
        } else {
          return res.status(500).json({ error: "mise à jour du pseudonyme utilisateur impossible" });
        }
      }
    );
  },
  updateLastname: function (req, res) {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN); // lien avec fichier .env
    const userId = decodedToken.userId;

    // Paramètres
    const lastname = req.body.lastname;

    if (!name_regex.test(lastname)) {
      return res.status(400).json({ error: "NOM non valide" });
    }
    asyncLib.waterfall(
      [
        // récupère l'utilisateur dans la DBase
        function (done) {
          models.User.findOne({
            //attributes: ["id", "bio"],
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
            userFound
              .update({
                lastname: lastname ? lastname : userFound.lastname,
              })
              .then(function () {
                done(userFound);
              })
              .catch(function (err) {
                res.status(500).json({ error: "mise à jour utilisateur impossible" });
              });
          } else {
            res.status(404).json({ error: "utilisateur introuvable" });
          }
        },
      ],
      function (userFound) {
        if (userFound) {
          return res.status(201).json(userFound);
        } else {
          return res.status(500).json({ error: "mise à jour du pseudonyme utilisateur impossible" });
        }
      }
    );
  },
  updateEmail: function (req, res) {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN); // lien avec fichier .env
    const userId = decodedToken.userId;

    // Paramètres
    const email = req.body.email;
    const groupomaniaEmail = email.split("@");

    if (!email_regex.test(email)) {
      return res.status(400).json({ error: "e-mail non valide" });
    }

    if (groupomaniaEmail[1] !== "groupomania.com") {
      return res.status(400).json({
        error: "Votre e-mail doit se terminer par @groupomania.com",
      });
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
          models.User.findOne({
            attributes: ["email"],
            where: { email: email },
          })
            .then(function (mailFound) {
              done(null, userFound, mailFound);
            })
            .catch(function (err) {
              return res.status(500).json({ error: "vérification utilisateur impossible" });
            });
        },
        function (userFound, mailFound, done) {
          if (!mailFound) {
            done(null, userFound, mailFound);
          } else {
            return res.status(409).json({ error: "e-mail déjà existant" });
          }
        },
        function (userFound, mailFound, done) {
          if (userFound) {
            userFound
              .update({
                email: email ? email : userFound.email,
              })
              .then(function () {
                done(userFound);
              })
              .catch(function (err) {
                res.status(500).json({ error: "mise à jour impossible" });
              });
          } else {
            res.status(404).json({ error: "utilisateur introuvable" });
          }
        },
      ],
      function (userFound) {
        if (userFound) {
          return res.status(201).json(userFound);
        } else {
          return res.status(500).json({ error: "mise à jour de l'e-mail impossible" });
        }
      }
    );
  },

  updatePassword: function (req, res) {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN); // lien avec fichier .env
    const userId = decodedToken.userId;

    let oldPassword = req.body.oldPassword;
    let newPassword = req.body.newPassword;

    if (!password_regex.test(newPassword)) {
      return res.status(400).json({
        error:
          "mot de passe non valide, 8 caractères minimum, contenant au moins une lettre minuscule, une lettre majuscule, un chiffre numérique et un caractère spécial",
      });
    }
    asyncLib.waterfall([
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
          bcrypt.compare(oldPassword, userFound.password, function (errBycrypt, resBycrypt) {
            done(null, userFound, resBycrypt);
          });
        } else {
          return res.status(404).json({ error: "utilisateur absent de la base de donnée" });
        }
      },
      function (userFound, resBycrypt, done) {
        if (resBycrypt) {
          bcrypt.hash(newPassword, 5, function (err, bcryptedPassword) {
            done(null, userFound, bcryptedPassword);
          });
        } else {
          return res.status(409).json({ error: "une erreur est survenue" });
        }
      },
      function (userFound, bcryptedPassword, done) {
        if (userFound) {
          userFound
            .update({
              password: bcryptedPassword,
            })
            .then(function (updatedUser) {
              return res.status(201).json(updatedUser);
            });
        } else {
          return res.status(500).json({ error: "mise à jour du mot de passe impossible" });
        }
      },
    ]);
  },

  deleteUser: function (req, res) {
    // Getting auth header
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN);
    const userId = decodedToken.userId;
    // Params
    models.User.findByPk(req.params.id).then(function (userFound) {
      models.User.findAndCountAll({
        where: { isAdmin: true },
      }).then((allUserAdmin) => {
        if (userFound.isAdmin && allUserAdmin.count < 2) {
          return res.status(400).json({ error: "Donner les droits d'administrateur à un autre compte" });
        } else {
          asyncLib.waterfall([
            function (done) {
              models.User.findByPk(req.params.id)
                .then(function (userFound) {
                  done(null, userFound);
                })
                .catch(function (err) {
                  return res.status(500).json({ error: "1 impossible de vérifier l'utilisateur" });
                });
            },
            function (userFound, done) {
              models.User.findOne({
                where: { isAdmin: true, id: userId },
              })
                .then(function (userAdminFound) {
                  done(null, userFound, userAdminFound);
                })
                .catch(function (err) {
                  return res.status(500).json({ error: "2 impossible de vérifier l'utilisateur" });
                });
            },
            function (userFound, userAdminFound, done) {
              models.Message.findAll({
                attributes: ["id", "attachment", "likes", "dislikes", "comments"],
              })
                .then((allMessageFound) => {
                  let messageIdTab = [];
                  allMessageFound.forEach((element) => {
                    messageIdTab.push(element.id);
                  });
                  done(null, userFound, userAdminFound, messageIdTab);
                })
                .catch(function (err) {
                  return res.status(500).json({ error: "3 impossible de vérifier tous les messages" });
                });
            },

            function (userFound, userAdminFound, messageIdTab, done) {
              models.Like.findAll({
                where: { userId: userFound.id, userDislike: true },
                attributes: ["messageId"],
              })
                .then(function (allLikeFoundDislike) {
                  done(null, userFound, userAdminFound, messageIdTab, allLikeFoundDislike);
                })
                .catch(function (err) {
                  return res.status(500).json({ error: "4 impossible de vérifier tous les userDislike" });
                });
            },

            function (userFound, userAdminFound, messageIdTab, allLikeFoundDislike, done) {
              models.Like.findAll({
                where: { userId: userFound.id, userLike: true },
                attributes: ["messageId"],
              })
                .then(function (allLikeFoundLike) {
                  done(null, userFound, userAdminFound, messageIdTab, allLikeFoundDislike, allLikeFoundLike);
                })
                .catch(function (err) {
                  return res.status(500).json({ error: "5 impossible de vérifier tous les userLike" });
                });
            },

            function (userFound, userAdminFound, messageIdTab, allLikeFoundDislike, allLikeFoundLike, done) {
              models.Comment.findAll({
                where: { userId: userFound.id, messageId: messageIdTab },
                attributes: ["id", "messageId"],
              })
                .then(function (allCommentFound) {
                  let messageToDelete = Object.values(
                    allCommentFound.reduce((a, { messageId }) => {
                      let key = `${messageId}`;
                      a[key] = a[key] || { messageId, count: 0 };
                      a[key].count++;
                      return a;
                    }, {})
                  );
                  const abc = JSON.parse(JSON.stringify(allCommentFound)).sort((a, b) =>
                    a.messageId < b.messageId ? 1 : b.messageId < a.messageId ? -1 : 0
                  );
                  const userMessageComment =
                    abc.length > 0
                      ? abc
                          .map((item) => item.messageId)
                          .filter((elt, i, a) => a.indexOf(elt) === i)
                          .sort((a, b) => a - b)
                      : [];
                  done(
                    null,
                    userFound,
                    userAdminFound,
                    allLikeFoundDislike,
                    allLikeFoundLike,
                    messageToDelete,
                    userMessageComment
                  );
                })
                .catch(function (err) {
                  return res.status(500).json({ error: "6 impossible de vérifier tous les commentaires" });
                });
            },

            function (
              userFound,
              userAdminFound,
              allLikeFoundDislike,
              allLikeFoundLike,
              messageToDelete,
              userMessageComment,
              done
            ) {
              models.CommentsLike.findAll({
                where: { userId: userFound.id, userLike: true },
                attributes: ["commentId"],
              })
                .then(function (allCommentLikeFoundLike) {
                  done(
                    null,
                    userFound,
                    userAdminFound,
                    allLikeFoundDislike,
                    allLikeFoundLike,
                    allCommentLikeFoundLike,
                    messageToDelete,
                    userMessageComment
                  );
                })
                .catch(function (err) {
                  return res.status(500).json({ error: "7 impossible de vérifier tous les commentsLike" });
                });
            },

            function (
              userFound,
              userAdminFound,
              allLikeFoundDislike,
              allLikeFoundLike,
              allCommentLikeFoundLike,
              messageToDelete,
              userMessageComment,
              done
            ) {
              models.CommentsLike.findAll({
                where: { userId: userFound.id, userDislike: true },
                attributes: ["commentId"],
              })
                .then(function (allCommentLikeFoundDislike) {
                  done(
                    null,
                    userFound,
                    userAdminFound,
                    allLikeFoundDislike,
                    allLikeFoundLike,
                    allCommentLikeFoundLike,
                    allCommentLikeFoundDislike,
                    messageToDelete,
                    userMessageComment
                  );
                })
                .catch(function (err) {
                  return res.status(500).json({ error: "8 impossible de vérifier tous les commentsDislike" });
                });
            },
            function (
              userFound,
              userAdminFound,
              allLikeFoundDislike,
              allLikeFoundLike,
              allCommentLikeFoundLike,
              allCommentLikeFoundDislike,
              messageToDelete,
              userMessageComment,
              done
            ) {
              if (userFound.id === userId || (userAdminFound.isAdmin === true && userAdminFound.id === userId)) {
                models.Message.findAll({
                  where: { userId: userFound.id },
                  attributes: ["id"],
                })
                  .then((result) => {
                    let tabMessageId = [];
                    result.forEach(({ id }) => {
                      tabMessageId.push(id);
                    });
                    models.Like.destroy({
                      where: { messageId: tabMessageId },
                    });
                  })
                  .then(() => {
                    models.Like.destroy({
                      where: { userId: userFound.id },
                    })
                      .then((result) => {
                        let likeMessageIdTabDislike = [];
                        allLikeFoundDislike.forEach((element) => {
                          likeMessageIdTabDislike.push(element.messageId);
                        });
                        models.Message.decrement(
                          { dislikes: 1 },
                          {
                            where: { id: likeMessageIdTabDislike },
                          }
                        );
                      })
                      .then((result) => {
                        let likeMessageIdTabLike = [];
                        allLikeFoundLike.forEach((element) => {
                          likeMessageIdTabLike.push(element.messageId);
                        });
                        models.Message.decrement(
                          { likes: 1 },
                          {
                            where: { id: likeMessageIdTabLike },
                          }
                        );
                      })
                      .then(function () {
                        done(
                          null,
                          userFound,
                          userAdminFound,
                          allCommentLikeFoundLike,
                          allCommentLikeFoundDislike,
                          userMessageComment,
                          messageToDelete
                        );
                      })
                      .catch((err) => {
                        return res.status(500).json({ error: "9 impossible de supprimer les likes" });
                      });
                  });
              } else {
                return res.status(500).json({ error: "Vous n'avez pas les droits" });
              }
            },

            function (
              userFound,
              userAdminFound,
              allCommentLikeFoundLike,
              allCommentLikeFoundDislike,
              userMessageComment,
              messageToDelete,
              done
            ) {
              if (userFound.id === userId || (userAdminFound.isAdmin === true && userAdminFound.id === userId)) {
                models.Message.findAll({
                  where: { userId: userFound.id },
                  attributes: ["id"],
                })
                  .then((result) => {
                    let tabMessageId = [];
                    result.forEach(({ id }) => {
                      tabMessageId.push(id);
                    });
                    return tabMessageId;
                  })
                  .then((tabMessageId) => {
                    models.Comment.findAll({
                      where: { messageId: tabMessageId },
                      attributes: ["id"],
                    })
                      .then((result) => {
                        let tabCommentId = [];
                        result.forEach(({ id }) => {
                          tabCommentId.push(id);
                        });
                        models.CommentsLike.destroy({
                          where: { commentId: tabCommentId },
                        });
                      })
                      .then(() => {
                        models.CommentsLike.destroy({
                          where: { userId: userFound.id },
                        })
                          .then(() => {
                            let commentLikeMessageIdTablike = [];
                            allCommentLikeFoundLike.forEach((element) => {
                              commentLikeMessageIdTablike.push(element.commentId);
                            });
                            models.Comment.decrement(
                              { commentLikes: 1 },
                              {
                                where: { id: commentLikeMessageIdTablike },
                              }
                            );
                          })
                          .then(() => {
                            let commentLikeMessageIdTabDislike = [];
                            allCommentLikeFoundDislike.forEach((element) => {
                              commentLikeMessageIdTabDislike.push(element.commentId);
                            });
                            models.Comment.decrement(
                              { commentDislikes: 1 },
                              {
                                where: { id: commentLikeMessageIdTabDislike },
                              }
                            );
                          })
                          .then(() => {
                            done(null, userFound, userAdminFound, userMessageComment, messageToDelete);
                          })
                          .catch((err) => {
                            return res.status(500).json({ error: "10 impossible de supprimer les commentaires" });
                          });
                      });
                  });
              } else {
                return res.status(500).json({ error: "Vous n'avez pas les droits" });
              }
            },

            function (userFound, userAdminFound, userMessageComment, messageToDelete, done) {
              if (userFound.id === userId || (userAdminFound.isAdmin === true && userAdminFound.id === userId)) {
                models.Message.findAll({
                  where: { userId: userFound.id },
                  attributes: ["id"],
                })
                  .then((result) => {
                    let tabMessageId = [];
                    result.forEach(({ id }) => {
                      tabMessageId.push(id);
                    });
                    models.Comment.destroy({
                      where: { messageId: tabMessageId },
                    });
                  })
                  .then(() => {
                    if (userMessageComment) {
                      models.Message.findAll({
                        where: { id: userMessageComment },
                      })
                        .then((result) => {
                          const finalTab = [];
                          const objectsEqual = (o1, o2) => {
                            Object.keys(o1).map((elt, p) => {
                              if (o1[p].messageId === o2[p]?.id) {
                                o2[p].comments = o2[p].comments - o1[p].count;
                                finalTab.push(o2[p]);
                              }
                            });
                          };
                          objectsEqual(messageToDelete, result);
                          userMessageComment.map((id, i) => {
                            models.Message.update(
                              { comments: finalTab[i].comments },
                              {
                                where: { id },
                              }
                            );
                          });
                        })
                        .then(() => {
                          models.Comment.destroy({
                            where: { userId: userFound.id },
                          });
                        })
                        .then(() => {
                          done(null, userFound, userAdminFound);
                        })
                        .catch((err) => {
                          return res.status(500).json({ error: "11 impossible de supprimer les commentLikes" });
                        });
                    } else {
                      done(null, userFound);
                    }
                  });
              } else {
                return res.status(500).json({ error: "Vous n'avez pas les droits" });
              }
            },

            function (userFound, userAdminFound, done) {
              if (userFound.id === userId || (userAdminFound.isAdmin === true && userAdminFound.id === userId)) {
                models.Message.findAll({
                  where: { userId: userFound.id },
                }).then((result) => {
                  const resultAttachment = result.filter(({ attachment }) => {
                    return attachment !== null;
                  });
                  if (resultAttachment.length) {
                    const dynamiquePath = __dirname.split("controllers").shift();
                    const files = resultAttachment.map((message) => message.attachment);
                    const deleteFiles = (files, callback) => {
                      let i = files.length;
                      files.forEach((filepath) => {
                        let fileName = filepath.split("http://localhost:8080/").pop();
                        fileName = dynamiquePath + fileName;

                        fs.unlink(fileName, (err) => {
                          i--;
                          if (err) {
                            callback(err);
                            return;
                          } else if (i <= 0) {
                            callback(null);
                          }
                        });
                      });
                    };
                    deleteFiles(files, (err) => {
                      if (err) {
                        console.log(err);
                      } else {
                        console.log("all files removed");
                        models.Message.destroy({
                          where: { userId: userFound.id },
                        })
                          .then(() => {
                            done(null, userFound, userAdminFound);
                          })
                          .catch((err) => {
                            return res.status(500).json({ error: "12 impossible de supprimer les messages" });
                          });
                      }
                    });
                  } else {
                    models.Message.destroy({
                      where: { userId: userFound.id },
                    })
                      .then(() => {
                        done(null, userFound, userAdminFound);
                      })
                      .catch((err) => {
                        return res.status(500).json({ error: "13 impossible de supprimer les messages" });
                      });
                  }
                });
              } else {
                return res.status(500).json({ error: "vous n'avez pas les droits" });
              }
            },

            function (userFound, userAdminFound, done) {
              if (userFound.id === userId || (userAdminFound.isAdmin === true && userAdminFound.id === userId)) {
                userFound
                  .destroy({
                    where: { userId: userFound.id },
                  })
                  .then(() => {
                    return res.status(201).json("Le compte à été supprimé avec succès");
                  });
              } else {
                return res.status(500).json({ error: "vous n'avez pas les droits" });
              }
            },
          ]);
        }
      });
    });
  },
  giveAdminOtherUser: function (req, res) {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN);
    const userId = decodedToken.userId;

    asyncLib.waterfall(
      [
        function (done) {
          models.User.findByPk(req.params.id)
            .then(function (userfound) {
              done(null, userfound);
            })
            .catch(function (err) {
              return res.status(500).json({ error: "impossible de vérifier l'utilisateur" });
            });
        },
        function (userfound, done) {
          models.User.findOne({
            where: { isAdmin: true, id: userId },
          })
            .then(function (userAdminFound) {
              done(null, userfound, userAdminFound);
            })
            .catch(function (err) {
              return res.status(500).json({ error: "impossible de vérifier l'admin" });
            });
        },

        function (userfound, userAdminFound, done) {
          if (userAdminFound.isAdmin === true && userAdminFound.id === userId) {
            if (userfound.isAdmin === false) {
              userfound
                .update({
                  isAdmin: true,
                })
                .then(function (newUserAdmin) {
                  return res.status(201).json(newUserAdmin.isAdmin);
                });
            } else if (userfound.isAdmin === true) {
              userfound
                .update({
                  isAdmin: false,
                })
                .then(function (newUserAdmin) {
                  return res.status(201).json(newUserAdmin.isAdmin);
                });
            }
          } else {
            return res.status(500).json({ error: "vous n'avez pas les droits" });
          }
        },
      ],
      function (userFound) {
        if (userFound) {
          return res.status(201).json(userFound);
        } else {
          return res.status(500).json({ error: "impossible de donner les droits à l'utilisateur" });
        }
      }
    );
  },
};
