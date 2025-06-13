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
const { SAutomationPostage, ActivityLog } = require(rootPath +
  "/helpers/controller");

/**
 * @description semen automation postage registration
 */
router.post(
  "/",
  auth,
  validate.sautomationpostage.post(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const transaction = await db.sequelize.transaction();

      try {
        const sAutomationPostage = await SAutomationPostage.addPostage(
          req,
          transaction
        );

        req.activity = {
          performedOnId: sAutomationPostage.SANumber,
          type: "animal",
          action: "SA_POSTAGE_REG",
          meta: { sAutomationPostage },
        };
        await ActivityLog.create(req, transaction);

        await transaction.commit();

        return res.json(
          successRespSync({
            msg: success.REGISTERED,
            data: { sAutomationPostage },
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
 * @description semen automation postage listing
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
        "customerName",
        "customerAddress",
        "orderDate",
        "postId",
        "postageDate",
        "deliveryDate",
        "deliveryStatus",
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

      const sAutomationPostage = await SAutomationPostage.listPostages(
        req,
        where,
        attributes
      );

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: { sAutomationPostage },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description semen automation postage details fetching
 */
router.get(
  "/:SANumber",
  auth,
  validate.sautomationpostage.get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      // return res.json("fetching details");
      const { SANumber } = req.params;

      const where = { SANumber };
      const sAutomationPostage = await SAutomationPostage.getDetails(where);

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: { sAutomationPostage },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description semen automation postage details update
 */
router.put(
  "/",
  auth,
  validate.sautomationpostage.put(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { SANumber } = req.body;
      await SAutomationPostage.update(req);
      const where = { SANumber };
      const sAutomationPostage = await SAutomationPostage.getDetails(where);
      req.activity = {
        performedOnId: SANumber,
        type: "animal",
        action: "SA_POSTAGE_UPDATED",
        meta: { body: req.body },
      };
      await ActivityLog.create(req);
      return res.json(
        successRespSync({
          msg: success.UPDATED,
          data: { sAutomationPostage },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;
