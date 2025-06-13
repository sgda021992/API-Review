const express = require("express");
const moment = require("moment");
const router = express.Router();
const db = require(rootPath + "/models");
const { serverError, successRespSync } = require(rootPath + "/helpers/api");
const { success } = require(rootPath + "/helpers/language");
const { logErrorOccurred, notEmpty } = require(rootPath + "/helpers/general");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
const controller = require(rootPath + "/helpers/controller");

/**
 * @description get option list for sire
 */
router.get(
  "/sire",
  validate.optionValidation(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { search } = req.query;

      const attribute = ["animalNumber", "tagNumber", "name"];
      // date limit for calf
      const calfPeriod = process.env.CALF_PERIOD;
      const greaterThen = moment.utc().subtract(calfPeriod, "days");
      let where = {
        gender: "male",
        steer: false,
        dob: { [db.Sequelize.Op.lt]: greaterThen },
      };

      // check if search query is not empty
      if (notEmpty(search)) {
        let searchQuery = [];
        const fields = attribute;
        // loop all fields
        fields.forEach((field) => {
          let query = {};
          query[field] = {
            [db.Sequelize.Op.like]: "%" + search + "%",
          };
          searchQuery.push(query);
        });
        // update where query
        where = { ...where, [db.Sequelize.Op.or]: searchQuery };
      }
      // fetch sire list
      const { rows: sires } = await controller.listAllAnimals(
        req,
        attribute,
        where,
        false
      );

      // send response
      res.json(
        successRespSync({
          msg: success.FETCH,
          data: { sires },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description get option list for sire
 */
router.get(
  "/dam",
  validate.optionValidation(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { search, discardDamId } = req.query;

      const attribute = ["animalNumber", "tagNumber", "name"];
      // date limit for calf
      const calfPeriod = process.env.CALF_PERIOD;
      const greaterThen = moment.utc().subtract(calfPeriod, "days");
      let where = {
        gender: "female",
        steer: false,
        dob: { [db.Sequelize.Op.lt]: greaterThen },
      };

      // check if search query is not empty
      if (notEmpty(discardDamId)) {
        where = {
          ...where,
          animalNumber: { [db.Sequelize.Op.ne]: discardDamId },
        };
      }

      // check if search query is not empty
      if (notEmpty(search)) {
        let searchQuery = [];
        const fields = attribute;
        // loop all fields
        fields.forEach((field) => {
          let query = {};
          query[field] = {
            [db.Sequelize.Op.like]: "%" + search + "%",
          };
          searchQuery.push(query);
        });
        // update where query
        where = { ...where, [db.Sequelize.Op.or]: searchQuery };
      }
      // fetch sire list
      const { rows: sires } = await controller.listAllAnimals(
        req,
        attribute,
        where,
        false
      );

      // send response
      res.json(
        successRespSync({
          msg: success.FETCH,
          data: { sires },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description get option list for sire
 */
router.get(
  "/breeds",
  validate.optionValidation(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const attribute = ["id", ["breedName", "name"]];
      const where = null;

      // fetch breed list of the animals
      const animalBreeds = await controller.getAnimalBreeds(
        req,
        attribute,
        where
      );

      // send response
      res.json(
        successRespSync({
          msg: success.FETCH,
          data: { animalBreeds },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description list all the animals as options
 */
router.get(
  "/list",
  validate.optionValidation(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { search } = req.query;
      const attributes = ["animalNumber", "name", "farmNumber", "tagNumber"];
      let where = null;

      // check if search query is not empty
      if (notEmpty(search)) {
        const fields = attributes;
        const searchQuery = fields.map((col) => {
          return {
            [col]: {
              [db.Sequelize.Op.like]: "%" + search + "%",
            },
          };
        });
        where = { ...where, [db.Sequelize.Op.or]: searchQuery };
      }

      const { count, rows } = await controller.listAllAnimals(
        req,
        attributes,
        where,
        false
      );

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: {
            animals: rows,
          },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;
