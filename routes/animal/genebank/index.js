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
 * @description animal gene bank registration
 */
router.post(
  "/",
  auth,
  validate.genebank.post(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        animalNumber,
        gender,
        breedId,
        sampleDate,
        preparationDate,
        sampleMotilityOptId,
        numberOfStraws,
        locationId,
        batchNumber,
        sampleConcentration,
        technicalName,
      } = req.body;

      // property to be inserted into animal genetic worth
      let set = {
        userId,
        animalNumber,
        gender,
        breedId,
        sampleDate: notEmpty(sampleDate)
          ? moment.utc(sampleDate, process.env.ACCEPT_FORMAT)
          : undefined,
        preparationDate: notEmpty(preparationDate)
          ? moment.utc(preparationDate, process.env.ACCEPT_FORMAT)
          : undefined,
        sampleMotilityOptId,
        numberOfStraws,
        locationId,
        batchNumber,
        sampleConcentration,
        technicalName,
      };

      // remove empty values before inserting
      removeEmptyValuesFromObject(set);

      const transaction = await db.sequelize.transaction();

      try {
        // create new record
        let geneBank = await db.GeneBank.create(set, { transaction });

        // generate  geneBankNumber,
        const geneBankNumber = getFormattedId("GBNK", geneBank.id);
        // update geneBankNumber
        const [updated] = await db.GeneBank.update(
          { geneBankNumber },
          { where: { id: geneBank.id }, transaction }
        );

        // reformat data
        geneBank = {
          geneBankNumber,
          ...(await geneBank.toJSON()),
          id: undefined,
          userId: undefined,
        };

        // add animal activity log
        await controller.AnimalActivityLog.addActivityLog(req, {
          action: "GENEBANK_REG",
          animalNumber,
        });

        req.activity = {
          performedOnId: animalNumber,
          type: "animal",
          action: "GENEBANK_REG",
          meta: {},
        };
        await controller.ActivityLog.create(req, transaction);

        // commit transaction
        await transaction.commit();

        // send response back
        return res.json(
          await successResp({
            msg: success.REGISTERED,
            data: {
              geneBank,
            },
          })
        );
      } catch (e) {
        await transaction.rollback(); //rollback the transaction
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
 * @desc fetch data of animal gene bank data
 */
router.get(
  "/",
  auth,
  validate.genebank.getAll(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { gender = "male", search } = req.query;

      // aruguments for the listGeneBanks function

      const attributes = [
        "geneBankNumber",
        "animalNumber",
        "gender",
        "breedId",
        "sampleDate",
        "preparationDate",
        "sampleMotilityOptId",
        "numberOfStraws",
        "locationId",
        "batchNumber",
        "sampleConcentration",
        "technicalName",
        "createdAt",
        "updatedAt",
      ]; // attribute array

      let where = { gender }; // condition for fetching details

      // check if search query is not empty
      if (notEmpty(search)) {
        let searchQuery = [];
        const fields = attributes;

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
      let geneBanks = await controller.GeneBank.listGeneBanks(
        req,
        attributes,
        where
      );
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);

      // send response
      return res.json(
        successRespSync({
          msg: geneBanks == null ? respError.NOT_FOUND : success.FETCH,
          data: {
            geneBanks,
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
 * @desc get animal gene bank data with geneBankNumber
 */
router.get(
  "/:geneBankNumber",
  auth,
  validate.genebank.get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { geneBankNumber } = req.params;

      // attribute array
      const attributes = null;
      // condition
      const where = { geneBankNumber };
      // fetch data
      let geneBank = await controller.GeneBank.getGeneBankDetails(
        req,
        attributes,
        where
      );
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);

      // send response
      return res.json(
        successRespSync({
          msg: geneBank == null ? respError.NOT_FOUND : success.FETCH,
          data: {
            geneBank,
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
