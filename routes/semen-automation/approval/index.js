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
const { SAutomationApproval, ActivityLog } = require(rootPath +
  "/helpers/controller");

/**
 * @description semen automation approval registration
 */
router.post(
  "/",
  auth,
  validate.sautomationapproval.post(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const transaction = await db.sequelize.transaction();

      try {
        const { sireId } = req.body;
        const sAutomationApproval = await SAutomationApproval.addApproval(
          req,
          transaction
        );

        req.activity = {
          performedOnId: sireId,
          type: "animal",
          action: "SA_APPROVAL_REG",
          meta: {},
        };
        await ActivityLog.create(req, transaction);

        await transaction.commit();

        return res.json(
          successRespSync({
            msg: success.REGISTERED,
            data: { sAutomationApproval },
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
 * @description semen automation approval listing
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
        "approvedManually",
        "researcher",
        "approvalDate",
        "recessiveDiseases",
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

      const sAutomationApproval = await SAutomationApproval.listApprovals(
        req,
        where,
        attributes
      );

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: { sAutomationApproval },
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
  validate.sautomationapproval.get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { SANumber } = req.params;

      const where = { SANumber };
      const sAutomationApproval = await SAutomationApproval.getDetails(where);

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: { sAutomationApproval },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description semen automation approval details update
 */
router.put(
  "/",
  auth,
  validate.sautomationapproval.put(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { SANumber } = req.body;

      await SAutomationApproval.update(req);

      const where = { SANumber };
      const sAutomationApproval = await SAutomationApproval.getDetails(where);

      req.activity = {
        performedOnId: sAutomationApproval.animalNumber,
        type: "animal",
        action: "SA_APPROVAL_UPDATED",
        meta: { body: req.body },
      };
      await ActivityLog.create(req);

      return res.json(
        successRespSync({
          msg: success.UPDATED,
          data: { sAutomationApproval },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;
