const express = require("express");
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
const { AnimalHealthRecord, TaskAnimal, ActivityLog } = require(rootPath +
  "/helpers/controller");

/**
 * @description submit animal health record data
 */
router.put(
  "/",
  auth,
  validate.task.healthRecord.put(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { animals, TENumber } = req.body;
      const taskNumber = await getTaskNumber(TENumber);
      req.body.taskNumber = taskNumber;

      const transaction = await db.sequelize.transaction();

      try {
        const result = await Promise.all(
          animals.map(async (row) => {
            req.body.healthRecord = row;
            const health = await AnimalHealthRecord.updateOrCreate(
              req,
              transaction
            );
            const animal = await TaskAnimal.updateOrCreate(req, transaction);

            req.activity = {
              performedOnId: row.animalNumber,
              type: "animal",
              action: "HEALTH_RECORD_SUBMITTED",
              meta: {},
            };
            await ActivityLog.create(req, transaction);

            return { health, animal };
          })
        );

        await transaction.commit();

        return res.json(
          successRespSync({
            msg: success.UPDATED,
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
