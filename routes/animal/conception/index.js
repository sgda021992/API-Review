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
} = require(rootPath + "/helpers/general"); // constant messages
// validations
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
// load helper controller
const controller = require(rootPath + "/helpers/controller");

/**
 * @description animal conception registration
 */
router.post(
  "/",
  auth,
  validate.animalconception.post(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { animalNumber } = req.body;

      const transaction = await db.sequelize.transaction();
      try {
        let response;

        const conception =
          await controller.AnimalConception.registerConceptionData(
            req,
            transaction
          );

        const semenEmbryo =
          await controller.AnimalConception.registerSemenEmbryo(
            req,
            transaction
          );

        const pregnancyCheck =
          await controller.AnimalConception.registerPregnancyCheck(
            req,
            transaction
          );

        const birthInfo = await controller.AnimalConception.registerBirthInfo(
          req,
          transaction
        );

        // send registered data to the client
        response = {
          conception,
          semenEmbryo,
          pregnancyCheck,
          birthInfo,
        };

        // add animal activity log
        await controller.AnimalActivityLog.addActivityLog(req, {
          action: "ANIMAL_CONCEPTION_ADDED",
          animalNumber,
        });

        req.activity = {
          performedOnId: animalNumber,
          type: "animal",
          action: "ANIMAL_CONCEPTION_ADDED",
          meta: {},
        };
        await controller.ActivityLog.create(req, transaction);

        // commit
        await transaction.commit();

        // send response back
        return res.json(
          await successResp({
            msg: success.REGISTERED,
            data: {
              ...response,
            },
          })
        );
      } catch (err) {
        // rollback
        await transaction.rollback();
        logErrorOccurred(__filename, err);
        return serverError(res);
      }
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @desc fetch data of animal conception
 */
router.get(
  "/:animalNumber/:tab",
  auth,
  validate.listValidation(),
  validate.animalconception.get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { animalNumber, tab } = req.params;
      let { search } = req.query;
      var reg = /^\d+$/;
      if (search && search.match(reg)) {
        search = parseFloat(search)
      }
      // attributes required for tabs
      const tabAttributes = {
        conception: [
          "matingDate",
          "inseminatorName",
          "orgName",
          "breedingServiceNo",
          // "conceptionMethodOptId",
        ],
        semenembryo: [
          "matingDate",
          // "sireId",
          // "surrogateDamId",
          "embryoOrgName",
          "surrogateDamBreed",
          "sireBreed",
        ],
        pregnancycheck: [
          "pregnancyCheckDate",
          "conceptionSuccess",
          "pregnancyCheckOperatorName",
          "pregnancyCheckMethod",
        ],
        birthinfo: [
          "deliveryDate",
          // "calfId",
          "birthFarm",
          // "birthEaseOptId",
          "birthWeight",
          "birthWeightUom",
        ],
      };
      // join required for tabs
      const tabInclude = {
        conception: [
          {
            model: db.Option,
            as: "conceptionMethod",
            attributes: ["id", "name"],
            required: false,
            where: { groupName: "conception-method" },
          },
        ],
        semenembryo: [
          {
            model: db.Animal,
            as: "sire",
            attributes: ["animalNumber", "name"],
            required: false,
          },
          {
            model: db.Animal,
            as: "surrogateDam",
            attributes: ["animalNumber", "name"],
            required: false,
            where: { gender: "female" },
          },
          // {
          //   model: db.AnimalBreeds,
          //   as: "surrogateDamBreed",
          //   attributes: ["id", "breedName"],
          //   required: false,
          // },
          // {
          //   model: db.AnimalBreeds,
          //   as: "sireBreed",
          //   attributes: ["id", "breedName"],
          //   required: false,
          // },
        ],
        pregnancycheck: [],
        birthinfo: [
          {
            model: db.Animal,
            as: "calf",
            attributes: ["animalNumber", "name"],
            required: false,
          },
          {
            model: db.Option,
            as: "birthEase",
            attributes: ["name"],
            required: false,
            where: { groupName: "birth-ease" },
          },
        ],
      };

      // search join fields
      const tabSearchFields = {
        conception: ["$conceptionMethod.name$"],
        semenembryo: [
          "$surrogateDam.animalNumber$",
          "$surrogateDam.name$",
          "$sire.animalNumber$",
          "$sire.name$",
          "surrogateDamBreed",
          "sireBreed",
          // "$surrogateDamBreed.breedName$",
          // "$sireBreed.breedName$",
        ],
        birthinfo: ["$calf.name$", "$calf.animalNumber$", "$birthEase.name$"],
        pregnancycheck: [],
      };

      // required join
      const include = tabInclude[tab];
      // select column
      const attributes = tabAttributes[tab];
      // where condition
      let where = { animalNumber };
      // add search query
      if (notEmpty(search)) {
        let searchQuery = [];
        let fields = attributes;
        // add additional join table fields for searching
        fields = [...fields, ...tabSearchFields[tab]];
        fields.forEach((field) => {
          let query = {};
          switch (field) {
            case 'conceptionSuccess':
              query[field] = { [db.Sequelize.Op.eq]: (search.includes('n') || search.includes('N')) ? 0 : (search.includes('y') || search.includes('Y')) ? 1 : '' };
              break;
            case 'birthWeight':
              query[field] = { [db.Sequelize.Op.eq]: search };
              break;
            default:
              query[field] = { [db.Sequelize.Op.like]: "%" + search + "%" };
              break;
          }
          searchQuery.push(query);
        });
        where = { ...where, [db.Sequelize.Op.or]: searchQuery };
      }

      // fetch data
      let animalConception =
        await controller.AnimalConception.getConceptionData(
          req,
          attributes,
          where,
          include
        );
        const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
        const { respError } = require(rootPath + "/helpers/response/" + language);

      // send response
      return res.json(
        successRespSync({
          msg: animalConception == null ? respError.NOT_FOUND : success.FETCH,
          data: {
            animalConception,
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
 * @desc fetch data of all animal conception or embryo info
 */
router.get(
  "/:tab",
  auth,
  validate.listValidation(),
  validate.animalconception.getAll(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { tab } = req.params;

      // attributes required for tabs
      const tabAttributes = {
        conception: [
          "matingDate",
          "inseminatorName",
          "orgName",
          "breedingServiceNo",
          // "conceptionMethodOptId",
        ],
        semenembryo: [
          "matingDate",
          // "sireId",
          // "surrogateDamId",
          "embryoOrgName",
          "surrogateDamBreed",
          "sireBreed",
        ],
      };
      // join required for tabs
      const tabInclude = {
        conception: [
          {
            model: db.Option,
            as: "conceptionMethod",
            attributes: ["id", "name"],
            required: false,
            where: { groupName: "conception-method" },
          },
        ],
        semenembryo: [
          {
            model: db.Animal,
            as: "sire",
            attributes: ["animalNumber", "name"],
            required: false,
          },
          {
            model: db.Animal,
            as: "surrogateDam",
            attributes: ["animalNumber", "name"],
            required: false,
            where: { gender: "female" },
          },
          // {
          //   model: db.AnimalBreeds,
          //   as: "surrogateDamBreed",
          //   attributes: ["id", "breedName"],
          //   required: false,
          // },
          // {
          //   model: db.AnimalBreeds,
          //   as: "sireBreed",
          //   attributes: ["id", "breedName"],
          //   required: false,
          // },
        ],
      };

      // required join
      const include = tabInclude[tab];
      // select column
      const attributes = tabAttributes[tab];
      // where condition
      // let where = { animalNumber };
      let where = null;

      // fetch data
      let animalConception =
        await controller.AnimalConception.getAllConceptionData(
          req,
          attributes,
          where,
          include
        );
        const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
        const { respError } = require(rootPath + "/helpers/response/" + language);

      // send response
      return res.json(
        successRespSync({
          msg: animalConception == null ? respError.NOT_FOUND : success.FETCH,
          data: {
            animalConception,
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
 * @desc get all insemenation details of the animal with pagination
 */
router.get(
  "/",
  auth,
  validationErrorHandler,
  async (req, res) => {
    try {
      const attributes = null;
      let insemenationRecord =
        await controller.AnimalConception.getConceptionList(
          req,
          attributes,
        );
        const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
        const { respError } = require(rootPath + "/helpers/response/" + language);

      return res.json(
        successRespSync({
          msg: insemenationRecord == null ? respError.NOT_FOUND : success.FETCH,
          data: {
            insemenationRecord,
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
