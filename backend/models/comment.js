"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      // define association here
      models.Comment.belongsTo(models.User, {
        foreignKey: {
          allowNull: false,
        },
      });
      models.Comment.belongsTo(models.Message, {
        foreignKey: {
          allowNull: false,
        },
      });
      models.Comment.hasMany(models.CommentsLike, {
        foreignKey: "commentId",
      });
    }
  }
  Comment.init(
    {
      messageId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      content: DataTypes.STRING,
      commentLikes: DataTypes.INTEGER,
      commentDislikes: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Comment",
    }
  );
  return Comment;
};
