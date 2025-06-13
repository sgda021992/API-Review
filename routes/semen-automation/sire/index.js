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
const { SAutomationSire, ActivityLog } = require(rootPath +
  "/helpers/controller");

/**
 * @description semen automation sire registration
 */
router.post(
  "/",
  auth,
  validate.sautomationsire.post(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const transaction = await db.sequelize.transaction();

      try {
        const sAutomationSire = await SAutomationSire.addSire(req, transaction);

        req.activity = {
          performedOnId: sAutomationSire.animalNumber,
          type: "animal",
          action: "SA_SIRE_REG",
          meta: { sAutomationSire },
        };
        await ActivityLog.create(req);

        await transaction.commit();

        return res.json(
          successRespSync({
            msg: success.REGISTERED,
            data: { sAutomationSire },
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
 * @description semen automation sire listing
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
        "econIndexVal",
        "econIndexValUom",
        "progeniesCount",
        "createdAt",
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

      const sAutomationSire = await SAutomationSire.listSires(
        req,
        where,
        attributes
      );

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: { sAutomationSire },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description semen automation approval details fetching
 */
router.get(
  "/:SANumber",
  auth,
  validate.sautomationsire.get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      // return res.json("fetching details");
      const { SANumber } = req.params;

      const where = { SANumber };
      const sAutomationSire = await SAutomationSire.getDetails(where);

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: { sAutomationSire },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description semen automation sire details update
 */
router.put(
  "/",
  auth,
  validate.sautomationsire.put(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { SANumber } = req.body;

      await SAutomationSire.update(req);
      const where = { SANumber };
      const sAutomationSire = await SAutomationSire.getDetails(where);

      req.activity = {
        performedOnId: sAutomationSire.animalNumber,
        type: "animal",
        action: "SA_SIRE_UPDATED",
        meta: { body: req.body },
      };
      await ActivityLog.create(req);

      return res.json(
        successRespSync({
          msg: success.UPDATED,
          data: { sAutomationSire },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;
