"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Animal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasOne(models.Farm, {
        sourceKey: "farmNumber",
        foreignKey: "farmNumber",
        as: "farm",
      });

      this.hasOne(models.AnimalImage, {
        foreignKey: "animalNumber",
        sourceKey: "animalNumber",
        as: "img",
      });

      this.hasOne(models.AnimalBreeds, {
        foreignKey: "id",
        sourceKey: "breedId",
        as: "breedType",
      });

      this.hasOne(models.Animal, {
        foreignKey: "animalNumber",
        sourceKey: "damPubId",
        as: "dams",
      });

      this.hasOne(models.Animal, {
        foreignKey: "animalNumber",
        sourceKey: "sirePubId",
        as: "sires",
      });

      this.hasOne(models.AnimalCategory, {
        foreignKey: "id",
        sourceKey: "categoryId",
        as: "category",
      });

    }
  }
  Animal.init(
    {
      animalNumber: DataTypes.STRING,
      farmNumber: DataTypes.STRING,
      ownerUserNumber: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      uniqueIdentifier: DataTypes.STRING(200),
      countryId: DataTypes.INTEGER,
      origin: DataTypes.STRING,
      projectId: DataTypes.INTEGER,
      name: DataTypes.STRING(45),
      tattoo: DataTypes.STRING(200),
      registrationNumber: DataTypes.STRING(115),
      dob: DataTypes.DATE,
      birthWeight: DataTypes.FLOAT,
      colorId: DataTypes.INTEGER,
      markAnimal: DataTypes.BOOLEAN,
      markForSale: DataTypes.BOOLEAN,
      dateOfSale: DataTypes.DATE,
      markAsFeeder: DataTypes.BOOLEAN,
      twin: DataTypes.BOOLEAN,
      ageVerified: DataTypes.BOOLEAN,
      notManaged: DataTypes.BOOLEAN,
      plasticTag: DataTypes.STRING(45),
      metalTag: DataTypes.STRING(45),
      brisketTag: DataTypes.STRING(45),
      sirePubId: DataTypes.STRING,
      damPubId: DataTypes.STRING,
      surrogateDamPubId: DataTypes.STRING,
      gender: DataTypes.ENUM("male", "female"),
      breed: DataTypes.STRING,
      breedId: DataTypes.INTEGER,
      descirption: DataTypes.TEXT,
      distinguishFeatures: DataTypes.TEXT,
      raised: DataTypes.BOOLEAN,
      hornStatus: DataTypes.STRING,
      pureBred: DataTypes.BOOLEAN,
      died: DataTypes.BOOLEAN,
      dateOfDeath: DataTypes.DATE,
      tagType: DataTypes.STRING,
      tagNumber: DataTypes.STRING,
      birthEase: DataTypes.STRING,
      birthFarmId: DataTypes.INTEGER,
      ownerName: DataTypes.STRING,
      conceptionMethod: DataTypes.STRING,
      operator: DataTypes.STRING,
      operatorNumber: DataTypes.STRING,
      animalRemovedFarmId: DataTypes.INTEGER,
      animalRemovalDate: DataTypes.DATE,
      removedAnimalDestination: DataTypes.STRING,
      animalRemovalReason: DataTypes.STRING,
      trackingNumber: DataTypes.STRING,
      brand: DataTypes.STRING,
      previousOwnerName: DataTypes.STRING,
      breedAssociationName: DataTypes.STRING,
      breedAssociationRegNo: DataTypes.STRING,
      breeder: DataTypes.STRING,
      note: DataTypes.TEXT,
      steer: DataTypes.BOOLEAN,
      RFTagNumber: DataTypes.STRING,
      status: DataTypes.STRING,
      categoryId: DataTypes.INTEGER,
    },
    {
      sequelize,
      tableName: "animals",
      modelName: "Animal",
    }
  );
  return Animal;
};
