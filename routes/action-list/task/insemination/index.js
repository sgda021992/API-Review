const express = require("express");
const moment = require("moment");
const router = express.Router();
const auth = require(rootPath + "/middleware/auth");
const db = require(rootPath + "/models");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { success } = require(rootPath + "/helpers/language");
const { getTaskNumber } = require(rootPath + "/helpers/module");
const { logErrorOccurred } = require(rootPath + "/helpers/general");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
const { InseminatorStatistic, TaskAnimal, ActivityLog } = require(rootPath +
  "/helpers/controller");

/**
 * @description submit insemination record of the animal
 */
router.post(
  "/",
  auth,
  validate.task.insemination.post(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { animals, TENumber } = req.body;
      const taskNumber = await getTaskNumber(TENumber);
      req.body.taskNumber = taskNumber;

      const transaction = await db.sequelize.transaction();

      try {
        const result = await Promise.all(
          animals.map(async (row) => {
            const {
              animalNumber,
              inseminatorNumber,
              inseminatorName,
              conceptionRate,
              dateOfMeasurement,
            } = row;
            const set = {
              userId,
              animalNumber,
              inseminatorNumber,
              inseminatorName,
              conceptionRate,
              dateOfMeasurement: moment.utc(
                dateOfMeasurement,
                process.env.ACCEPT_DATE_FORMAT
              ),
            };
            const insemination = await InseminatorStatistic.register(
              set,
              transaction
            );
            const animal = await TaskAnimal.updateOrCreate(req, transaction);

            req.activity = {
              performedOnId: row.animalNumber,
              type: "animal",
              action: "INSEMINATION_RECORD_SUBMITTED",
              meta: {},
            };
            await ActivityLog.create(req, transaction);

            return { insemination, animal };
          })
        );

        await transaction.commit();

        return res.json(
          successRespSync({
            msg: success.CREATED,
            data: { result },
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

module.exports = router;
