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
const { SAutomationCollection, ActivityLog } = require(rootPath +
  "/helpers/controller");

/**
 * @description semen automation collection registration
 */
router.post(
  "/",
  auth,
  validate.sautomationcollection.post(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const transaction = await db.sequelize.transaction();

      try {
        const sAutomationCollection = await SAutomationCollection.addCollection(
          req,
          transaction
        );

        req.activity = {
          performedOnId: sAutomationCollection.animalNumber,
          type: "animal",
          action: "SA_COLLECTION_REG",
          meta: { sAutomationCollection },
        };
        await ActivityLog.create(req, transaction);

        await transaction.commit();

        return res.json(
          successRespSync({
            msg: success.REGISTERED,
            data: { sAutomationCollection },
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
 * @description semen automation collection listing
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
        "collectionTechnician",
        "preperationTechnician",
        "semenCollectionDate",
        "semenPreparationDate",
        "semenMotility",
        "semenConcentration",
        "semenConcentrationUom",
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

      const sAutomationCollection = await SAutomationCollection.listCollections(
        req,
        where,
        attributes
      );

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: { sAutomationCollection },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description semen automation collection details fetching
 */
router.get(
  "/:SANumber",
  auth,
  validate.sautomationcollection.get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      // return res.json("fetching details");
      const { SANumber } = req.params;

      const where = { SANumber };
      const sAutomationCollection = await SAutomationCollection.getDetails(
        where
      );

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: { sAutomationCollection },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description semen automation collection details update
 */
router.put(
  "/",
  auth,
  validate.sautomationcollection.put(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { SANumber } = req.body;

      await SAutomationCollection.update(req);
      const where = { SANumber };
      const sAutomationCollection = await SAutomationCollection.getDetails(
        where
      );

      req.activity = {
        performedOnId: sAutomationCollection.animalNumber,
        type: "animal",
        action: "SA_COLLECTION_UPDATED",
        meta: { body: req.body },
      };
      await ActivityLog.create(req);

      return res.json(
        successRespSync({
          msg: success.UPDATED,
          data: { sAutomationCollection },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;
