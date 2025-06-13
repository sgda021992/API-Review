const express = require("express");
const moment = require("moment");
const router = express.Router();
// loading models
const db = require(rootPath + "/models");
// loading middleware
const auth = require(rootPath + "/middleware/auth");
// loading helpers
const { successResp, successRespSync, serverError } = require(rootPath +
  "/helpers/api");
const { error, success } = require(rootPath + "/helpers/language"); // constant messages
const {
  logErrorOccurred,
  notEmpty,
  removeEmptyValuesFromObject,
  getFormattedId,
} = require(rootPath + "/helpers/general"); // constant messages
// validations
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
// load helper controller
const controller = require(rootPath + "/helpers/controller");

/**
 * @description animal genotype registration
 */
router.post(
  "/",
  auth,
  validate.animalgenotype.post(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const userId = req.user.id;
      // destructure the body
      const {
        animalNumber,
        genotypeAnimalId,
        technicianName,
        genoTypeData,
        genotypingServiceNote,
        numberOfSNP,
      } = req.body;

      // property to be inserted
      let set = {
        userId,
        animalNumber,
        genotypeAnimalId,
        technicianName,
        genoTypeData,
        genotypingServiceNote,
        numberOfSNP,
      };

      // remove empty values before inserting
      removeEmptyValuesFromObject(set);

      // create new record
      let genotype = await db.AnimalGenotype.create(set);

      // add animal activity log
      await controller.AnimalActivityLog.addActivityLog(req, {
        action: "GENOTYPE_REG",
        animalNumber,
      });

      req.activity = {
        performedOnId: animalNumber,
        type: "animal",
        action: "GENOTYPE_REG",
        meta: {},
      };
      await controller.ActivityLog.create(req);

      // reformat data
      genotype = {
        ...(await genotype.toJSON()),
        id: undefined,
        userId: undefined,
      };

      // send response back
      return res.json(
        await successResp({
          msg: success.REGISTERED,
          data: {
            genotype,
          },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description update animal genotype
 */
router.put(
  "/",
  auth,
  validate.animalgenotype.put(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { animalNumber } = req.body;

      // update animal genotype with animal number
      await controller.AnimalGenotype.updateAnimalGenotype(req);

      // send updated animal genotype details
      // condition
      const where = { animalNumber };
      // fetch data
      let genotype = await controller.AnimalGenotype.getGenotypeDetails(
        req,
        null,
        where
      );

      // add animal activity log
      await controller.AnimalActivityLog.addActivityLog(req, {
        action: "GENOTYPE_UPDATE",
        animalNumber,
      });

      req.activity = {
        performedOnId: animalNumber,
        type: "animal",
        action: "GENOTYPE_UPDATE",
        meta: {},
      };
      await controller.ActivityLog.create(req);

      return res.json(
        successRespSync({
          msg: success.UPDATED,
          data: {
            genotype,
          },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @desc get genotype details of the animal
 */
router.get(
  "/:animalNumber",
  auth,
  validate.animalgenotype.get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { animalNumber } = req.params;

      // attribute array
      const attributes = null;
      // condition
      const where = { animalNumber };
      // fetch data
      let genotype = await controller.AnimalGenotype.getGenotypeDetails(
        req,
        attributes,
        where
      );
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);

      // send response
      return res.json(
        successRespSync({
          msg: genotype == null ? respError.NOT_FOUND : success.FETCH,
          data: {
            genotype,
          },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @desc list genotype details of the all animals
 */
router.get(
  "/",
  auth,
  validate.animalgenotype.getAll(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { search } = req.query;

      // attribute array
      const attributes = null;
      // condition
      let where = null;
      // check if search query is not empty
      if (notEmpty(search)) {
        let searchQuery = [];
        const fields = [
          "animalNumber",
          "genotypeAnimalId",
          "technicianName",
          "genoTypeData",
          "genotypingServiceNote",
          "numberOfSNP",
        ];

        fields.forEach((field) => {
          let query = {};
          query[field] = {
            [db.Sequelize.Op.like]: "%" + search + "%",
          };
          searchQuery.push(query);
        });

        where = { ...where, [db.Sequelize.Op.or]: searchQuery };
      }

      // fetch data
      let genotype = await controller.AnimalGenotype.listGenotypes(
        req,
        attributes,
        where
      );
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);

      // send response
      return res.json(
        successRespSync({
          msg: genotype == null ? respError.NOT_FOUND : success.FETCH,
          data: {
            genotype,
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
