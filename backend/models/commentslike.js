"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CommentsLike extends Model {
    static associate(models) {
      // define association here
      this.belongsTo(models.Comment, {
        foreignKey: "commentId",
      }),
        this.belongsTo(models.User, {
          foreignKey: "userId",
        });
    }
  }
  CommentsLike.init(
    {
      commentId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      userLike: DataTypes.BOOLEAN,
      userDislike: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "CommentsLike",
    }
  );
  return CommentsLike;
};
