const express = require("express");
const router = express.Router();
const auth = require(rootPath + "/middleware/auth");
const db = require(rootPath + "/models");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { success } = require(rootPath + "/helpers/language");
const {
  logErrorOccurred,
  notEmpty,
  removeEmptyValuesFromObject,
} = require(rootPath + "/helpers/general");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
// controller
const controller = require(rootPath + "/helpers/controller");

/**
 * @description Register inseminator statistics
 */
router.post(
  "/",
  auth,
  validate.inseminatorstatistic.post(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const {
        inseminatorNumber,
        conceptionRate,
        dateOfMeasurement,
        inseminatorName,
      } = req.body;
      const { id: userId } = req.user;

      const set = {
        userId,
        inseminatorNumber,
        conceptionRate,
        dateOfMeasurement,
        inseminatorName,
      };

      removeEmptyValuesFromObject(set);

      const transaction = await db.sequelize.transaction();

      try {
        let inseminatorStatistic =
          await controller.InseminatorStatistic.register(set, transaction);

        req.activity = {
          performedOnId: inseminatorStatistic.inseminatorStatisticNo,
          type: "general",
          action: "INSEMINATOR_STATISTIC_REG",
          meta: {},
        };
        await controller.ActivityLog.create(req, transaction);

        await transaction.commit();

        return res.json(
          successRespSync({
            msg: success.REGISTERED,
            data: { inseminatorStatistic },
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
 * @description list all inseminator statistics
 */
router.get(
  "/",
  auth,
  validate.listValidation(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { search } = req.query;
      let where = null;

      // check if search query is not empty
      if (notEmpty(search)) {
        const fields = [
          "inseminatorStatisticNo",
          "inseminatorNumber",
          "inseminatorName",
          "conceptionRate",
          "dateOfMeasurement",
        ];
        const searchQuery = fields.map((col) => {
          return {
            [col]: {
              [db.Sequelize.Op.like]: "%" + search + "%",
            },
          };
        });
        // update where condition
        where = { ...where, [db.Sequelize.Op.or]: searchQuery };
      }
      const inseminatorStatistic =
        await controller.InseminatorStatistic.getList(req, where);

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: {
            inseminatorStatistic,
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
 * @description get details of inseminator statistics
 */
router.get(
  "/:inseminatorStatisticNo",
  auth,
  validate.inseminatorstatistic.get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { inseminatorStatisticNo } = req.params;
      let where = { inseminatorStatisticNo };

      const inseminatorStatistic =
        await controller.InseminatorStatistic.getDetails(where);

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: {
            inseminatorStatistic,
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
 * @description update inseminator statistics
 */
router.put(
  "/",
  auth,
  validate.inseminatorstatistic.put(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const {
        inseminatorStatisticNo,
        inseminatorNumber,
        conceptionRate,
        dateOfMeasurement,
        inseminatorName,
      } = req.body;

      const set = {
        inseminatorNumber,
        conceptionRate,
        dateOfMeasurement,
        inseminatorName,
      };
      removeEmptyValuesFromObject(set);

      const where = { inseminatorStatisticNo };
      await controller.InseminatorStatistic.update(set, where);
      // get updated details
      const inseminatorStatistic =
        await controller.InseminatorStatistic.getDetails(where);

      req.activity = {
        performedOnId: inseminatorStatisticNo,
        type: "general",
        action: "INSEMINATOR_STATISTIC_UPDATED",
        meta: {},
      };
      await controller.ActivityLog.create(req);

      return res.json(
        successRespSync({
          msg: success.UPDATED,
          data: { inseminatorStatistic },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;
