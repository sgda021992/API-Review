"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ActivityLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasOne(models.User, {
        sourceKey: "performedById",
        foreignKey: "id",
        as: "user",
      });
    }
  }
  ActivityLog.init(
    {
      performedById: DataTypes.INTEGER,
      performedOnId: DataTypes.STRING,
      lastPerformedById: DataTypes.STRING,
      lastUpdatedAt: DataTypes.DATE,
      type: DataTypes.ENUM("user", "animal", "farm", "general"),
      action: DataTypes.STRING,
      title: DataTypes.STRING,
      meta: DataTypes.JSON,
      status: DataTypes.ENUM("completed", "inprogress"),
      accessType: DataTypes.ENUM("read", "delete", "create", "update"),
      role: DataTypes.STRING,
      department: DataTypes.STRING,
      module: DataTypes.STRING,
    },
    {
      sequelize,
      tableName: "activity_logs",
      modelName: "ActivityLog",
    }
  );
  return ActivityLog;
};
