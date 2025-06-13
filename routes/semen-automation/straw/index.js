const express = require("express");
const router = express.Router();
const db = require(rootPath + "/models");
const auth = require(rootPath + "/middleware/auth");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { success } = require(rootPath + "/helpers/language");
const { logErrorOccurred, notEmpty } = require(rootPath + "/helpers/general");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
const { SAutomationStraw, ActivityLog } = require(rootPath +
  "/helpers/controller");

/**
 * @description semen automation straw registration
 */
router.post(
  "/",
  auth,
  validate.sautomationstraw.post(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const transaction = await db.sequelize.transaction();

      try {
        const sAutomationStraw = await SAutomationStraw.addStraw(
          req,
          transaction
        );

        req.activity = {
          performedOnId: sAutomationStraw.animalNumber,
          type: "animal",
          action: "SA_STRAW_REG",
          meta: { sAutomationStraw },
        };
        await ActivityLog.create(req, transaction);

        await transaction.commit();

        return res.json(
          successRespSync({
            msg: success.REGISTERED,
            data: { sAutomationStraw },
          })
        );
      } catch (err) {
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
 * @description semen automation straw listing
 */
router.get(
  "/",
  auth,
  validate.listValidation(),
  validationErrorHandler,
  async (req, res) => {
    try {
      let { animal: animalNumber, search } = req.query;

      const attributes = [
        "id",
        "SANumber",
        "animalNumber",
        "strawId",
        "numOfStaws",
        "batchNumber",
        "locationId",
      ];
      let where = { ...(notEmpty(animalNumber) ? { animalNumber } : null) };

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

      const sAutomationStraw = await SAutomationStraw.listStraws(
        req,
        where,
        attributes
      );

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: { sAutomationStraw },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description semen automation straw details fetching
 */
router.get(
  "/:SANumber",
  auth,
  validate.sautomationstraw.get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { SANumber } = req.params;

      const where = { SANumber };
      const sAutomationStraw = await SAutomationStraw.getDetails(where);

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: { sAutomationStraw },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description semen automation straw details update
 */
router.put(
  "/",
  auth,
  validate.sautomationstraw.put(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { SANumber } = req.body;

      await SAutomationStraw.update(req);
      const where = { SANumber };
      const sAutomationStraw = await SAutomationStraw.getDetails(where);

      req.activity = {
        performedOnId: sAutomationStraw.animalNumber,
        type: "animal",
        action: "SA_STRAW_UPDATED",
        meta: { body: req.body },
      };
      await ActivityLog.create(req);

      return res.json(
        successRespSync({
          msg: success.UPDATED,
          data: { sAutomationStraw },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;
