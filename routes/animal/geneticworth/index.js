const express = require("express");
const router = express.Router();
// loading models
const db = require(rootPath + "/models");
// loading middleware
const auth = require(rootPath + "/middleware/auth");
// loading helpers
const { successResp, successRespSync, serverError } = require(rootPath +
  "/helpers/api");
const { error, success } = require(rootPath + "/helpers/language"); // constant messages
const { logErrorOccurred } = require(rootPath + "/helpers/general"); // constant messages
// validations
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
// load helper controller
const controller = require(rootPath + "/helpers/controller");

/**
 * @description animal genetic worth registration
 */

router.post(
  "/",
  auth,
  validate.animalgeneticworth.post(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const userId = req.user.id;
      // return res.json(req.body);
      // destructure the body
      const {
        animalNumber,
        BVMethod,
        BVSoftware,
        scriptsPath,
        DPYBValue,
        DPYBValueAccuracy,
        DPYBValuePercent,
        DPYBValueRank,
        EI,
        EIAccuracy,
        EIAccuracyPercent,
        EIRank,
        DPYWight,
        DPYWightUom,
        DPYUsed,
      } = req.body;

      // property to be inserted into animal genetic worth
      let set = {
        userId,
        animalNumber,
        BVMethod,
        BVSoftware,
        scriptsPath,
        DPYBValue,
        DPYBValueAccuracy,
        DPYBValuePercent,
        DPYBValueRank,
        EI,
        EIAccuracy,
        EIAccuracyPercent,
        EIRank,
        DPYWight,
        DPYWightUom,
        DPYUsed,
      };

      // remove undefined values before inserting
      Object.keys(set).forEach((key) => {
        set[key] == undefined || set[key] == null ? delete set[key] : {};
      });

      // insert into DB
      let animalGeneticWorth = await db.AnimalGeneticWorth.create(set);
      // reformat data
      animalGeneticWorth = {
        ...(await animalGeneticWorth.toJSON()),
        id: undefined,
        userId: undefined,
      };

      // add animal activity log
      await controller.AnimalActivityLog.addActivityLog(req, {
        action: "GENETICWORTH_REG",
        animalNumber,
      });

      req.activity = {
        performedOnId: animalNumber,
        type: "animal",
        action: "GENETICWORTH_REG",
        meta: {},
      };
      await controller.ActivityLog.create(req);

      return res.json(
        await successResp({
          msg: success.GENETIC_WORTH_REGISTERED,
          data: {
            animalGeneticWorth,
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
 * @desc fetch animal genetic worth details of registered single animal
 */
router.get(
  "/:animalNumber",
  auth,
  validate.animalgeneticworth.get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { animalNumber } = req.params;

      const where = {
        animalNumber,
      }; // condition for fetching details
      const attributes = null; // attribute array

      // fetch data
      let geneticWorth =
        await controller.AnimalGeneticWorth.getGeneticWorthData(
          req,
          attributes,
          where
        );
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);

      // send response
      return res.json(
        successRespSync({
          msg: geneticWorth == null ? respError.NOT_FOUND : success.FETCH,
          data: {
            geneticWorth,
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
 * @description update animal genetic worth data with animal id
 */
router.put(
  "/",
  auth,
  validate.animalgeneticworth.put(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { animalNumber } = req.body;

      // update animal genetic worth
      const updated =
        await controller.AnimalGeneticWorth.updateAnimalGeneticWorth(req);

      // fetch data
      let geneticWorth =
        await controller.AnimalGeneticWorth.getGeneticWorthData(req, null, {
          animalNumber,
        });

      // add animal activity log
      await controller.AnimalActivityLog.addActivityLog(req, {
        action: "GENETICWORTH_UPDATE",
        animalNumber,
      });

      req.activity = {
        performedOnId: animalNumber,
        type: "animal",
        action: "GENETICWORTH_UPDATE",
        meta: {},
      };
      await controller.ActivityLog.create(req);

      // send response
      return res.json(
        successRespSync({
          msg: success.UPDATED,
          data: {
            geneticWorth,
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
