"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AnimalActivityLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // association with user table
      this.hasOne(models.User, {
        foreignKey: "userNumber",
        sourceKey: "id",
        as: "user",
      });
    }
  }
  AnimalActivityLog.init(
    {
      animalNumber: DataTypes.STRING,
      userNumber: DataTypes.INTEGER,
      action: DataTypes.STRING,
      activity: DataTypes.STRING,
      status: DataTypes.ENUM("completed", "in progress"),
      meta: DataTypes.TEXT,
    },
    {
      sequelize,
      tableName: "animal_activity_logs",
      modelName: "AnimalActivityLog",
    }
  );
  return AnimalActivityLog;
};
