const express = require("express");
const router = express.Router();
const db = require(rootPath + "/models");
const auth = require(rootPath + "/middleware/auth");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { error, success } = require(rootPath + "/helpers/language");
const { logErrorOccurred, notEmpty } = require(rootPath + "/helpers/general");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
const controller = require(rootPath + "/helpers/controller");
/**
 * @desc get all health record details of the animal with pagination
 */
router.get(
  "/treatments",
  auth,
  validationErrorHandler,
  async (req, res) => {
    try {
      const attributes = ["animalNumber", "attendingVeterinarian", "treatment", "treatmentDate", "treatmentReason"];
      let treatmentRecord =
        await controller.AnimalHealthRecord.getAllHealthRecordDetails(
          req,
          attributes,
        );
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);

      return res.json(
        successRespSync({
          msg: treatmentRecord == null ? respError.NOT_FOUND : success.FETCH,
          data: {
            treatmentRecord,
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
 * @description animal health record registration
 */
router.post(
  "/",
  auth,
  validate.animalhealthrecord.post(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { animalNumber } = req.body;
      const healthRecord = await controller.AnimalHealthRecord.create(req);

      req.activity = {
        performedOnId: animalNumber,
        type: "animal",
        action: "HEALTH_RECORD_REGISTERED",
        meta: { healthRecord },
      };
      await controller.ActivityLog.create(req);

      return res.json(
        await successRespSync({
          msg: success.REGISTERED,
          data: {
            healthRecord,
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
 * @desc get health record details of the animal with the animalID
 */
router.get(
  "/:animalNumber",
  auth,
  validate.animalhealthrecord.get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { animalNumber } = req.params;

      const attributes = null;
      const where = { animalNumber };

      let healthRecord =
        await controller.AnimalHealthRecord.getHealthRecordDetails(
          req,
          attributes,
          where
        );
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);

      return res.json(
        successRespSync({
          msg: healthRecord == null ? respError.NOT_FOUND : success.FETCH,
          data: {
            healthRecord,
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
 * @description update animal health record/Add updated health record of the animal
 */
router.put(
  "/",
  auth,
  validate.animalhealthrecord.put(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { animalNumber } = req.body;
      const healthRecord = await controller.AnimalHealthRecord.create(req);

      req.activity = {
        performedOnId: animalNumber,
        type: "animal",
        action: "HEALTH_RECORD_UPDATED",
        meta: { healthRecord },
      };
      await controller.ActivityLog.create(req);

      return res.json(
        successRespSync({
          msg: success.UPDATED,
          data: {
            healthRecord,
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
 * @desc get all health record details of the animal with pagination
 */

router.get(
  "/",
  auth,
  validationErrorHandler,
  async (req, res) => {
    try {
      const attributes = ["animalNumber", "diagnosis", "drugName", "drugWithdrawPeriod", "drugId", "treatmentDate"];
      let healthRecord =
        await controller.AnimalHealthRecord.getAllHealthRecordDetails(
          req,
          attributes,
        );
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);

      return res.json(
        successRespSync({
          msg: healthRecord == null ? respError.NOT_FOUND : success.FETCH,
          data: {
            healthRecord,
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
