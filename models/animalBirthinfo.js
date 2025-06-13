"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AnimalBirthinfo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // association for Animal for surrogate dam nick name
      this.hasOne(models.Animal, {
        sourceKey: "calfId",
        foreignKey: "animalNumber",
        as: "calf",
      });

      // association for conceptionMethodOptId
      this.hasOne(models.Option, {
        sourceKey: "birthEaseOptId",
        foreignKey: "id",
        as: "birthEase",
      });
      this.hasOne(models.Animal, {
        as: "animal",
        sourceKey: 'id',
        foreignKey: 'animalNumber',
      });
    }
  }
  AnimalBirthinfo.init(
    {
      userId: DataTypes.INTEGER,
      animalNumber: DataTypes.INTEGER,
      deliveryDate: DataTypes.DATE,
      calfId: DataTypes.STRING,
      birthFarm: DataTypes.STRING,
      birthEaseOptId: DataTypes.INTEGER,
      birthWeight: DataTypes.FLOAT,
      birthWeightUom: DataTypes.ENUM("kg", "gm"),
    },
    {
      sequelize,
      tableName: "animal_birthinfo",
      modelName: "AnimalBirthinfo",
    }
  );
  return AnimalBirthinfo;
};
