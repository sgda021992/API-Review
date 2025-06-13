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
const { SAutomationPack, ActivityLog } = require(rootPath +
  "/helpers/controller");

/**
 * @description semen automation pack registration
 */
router.post(
  "/",
  auth,
  validate.sautomationpack.post(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const transaction = await db.sequelize.transaction();

      try {
        const sAutomationPack = await SAutomationPack.addPack(req, transaction);

        req.activity = {
          performedOnId: sAutomationPack.animalNumber,
          type: "animal",
          action: "SA_PACK_REG",
          meta: { sAutomationPack },
        };
        await ActivityLog.create(req, transaction);

        await transaction.commit();

        return res.json(
          successRespSync({
            msg: success.REGISTERED,
            data: { sAutomationPack },
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
 * @description semen automation packs listing
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
        "packId",
        "orderedStrawNum",
        "packingTechnician",
        "createdAt"
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

      const sAutomationPack = await SAutomationPack.listPacks(
        req,
        where,
        attributes
      );

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: { sAutomationPack },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description semen automation pack details fetching
 */
router.get(
  "/:SANumber",
  auth,
  validate.sautomationpack.get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      // return res.json("fetching details");
      const { SANumber } = req.params;

      const where = { SANumber };
      const sAutomationPack = await SAutomationPack.getDetails(where);

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: { sAutomationPack },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description semen automation pack details update
 */
router.put(
  "/",
  auth,
  validate.sautomationpack.put(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { SANumber } = req.body;

      await SAutomationPack.update(req);
      const where = { SANumber };
      const sAutomationPack = await SAutomationPack.getDetails(where);

      req.activity = {
        performedOnId: sAutomationPack.animalNumber,
        type: "animal",
        action: "SA_PACK_UPDATED",
        meta: { body: req.body },
      };
      await ActivityLog.create(req);

      return res.json(
        successRespSync({
          msg: success.UPDATED,
          data: { sAutomationPack },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;
