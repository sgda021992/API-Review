const express = require("express");
const _ = require("lodash");
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
const {
  Task,
  TaskAssignee,
  TaskLocation,
  TaskAnimal,
  TaskEvent,
  ActivityLog,
} = require(rootPath + "/helpers/controller");

// sub routes
router.use("/health-record", require("./health-record"));
router.use("/insemination", require("./insemination"));

/**
 * @description create new task
 */
router.post(
  "/",
  auth,
  validate.task.post(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const transaction = await db.sequelize.transaction();

      try {
        let task = await Task.create(req, transaction);
        req.body.taskNumber = task.taskNumber;

        await Promise.all([
          TaskEvent.bulkCreate(req, transaction),
          TaskAssignee.bulkCreate(req, transaction),
          TaskLocation.bulkCreate(req, transaction),
          TaskAnimal.bulkCreate(req, transaction),
        ]);

        req.activity = {
          performedOnId: task.taskNumber,
          type: "general",
          action: "TASK_ADDED",
          meta: {},
        };
        await ActivityLog.create(req, transaction);

        await transaction.commit();

        return res.json(
          successRespSync({
            msg: success.CREATED,
            data: { task },
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
 * @description update task details
 */
router.put(
  "/",
  auth,
  validate.task.put(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { action, TENumber } = req.body;

      let teData = await TaskEvent.getDetails({ TENumber });
      req.body.taskNumber = teData.task.taskNumber;

      const transaction = await db.sequelize.transaction();

      try {
        let task;

        switch (action) {
          case "this": {
            await TaskEvent.updateOne(req, transaction);

            req.activity = {
              performedOnId: TENumber,
              type: "general",
              action: "TASK_UPDATED",
              meta: {},
            };
            await ActivityLog.create(req, transaction);

            await transaction.commit();

            task = await TaskEvent.getDetails({ TENumber });

            break;
          }
          case "following": {
            task = await TaskEvent.updateFollowing(req, transaction);

            req.activity = {
              performedOnId: task.taskNumber,
              type: "general",
              action: "TASK_UPDATED",
              meta: {},
            };
            await ActivityLog.create(req, transaction);

            await transaction.commit();
            break;
          }
          case "all": {
            task = await TaskEvent.updateAll(req, transaction);

            req.activity = {
              performedOnId: task.taskNumber,
              type: "general",
              action: "TASK_UPDATED",
              meta: {},
            };
            await ActivityLog.create(req, transaction);

            await transaction.commit();
            break;
          }
          default:
            await transaction.commit();
        }

        return res.json(
          successRespSync({
            msg: success.UPDATED,
            data: { task },
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
 * @description fetch details of the task event
 */
router.get(
  "/:TENumber",
  auth,
  validate.task.get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { TENumber } = req.params;

      const where = { TENumber };
      const task = await TaskEvent.getDetails(where);

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: { task },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description fetch list of the task
 */
router.get(
  "/",
  auth,
  validate.listValidation(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { search, status } = req.query;
      let where = null;

      switch (status) {
        case "active":
          where = { ...where, status: "todo" };
          break;
        case "inprogress":
          where = { ...where, status: "inprogress" };
          break;
        case "completed":
          where = { ...where, status: "done" };
          break;
      }
      // check if search query is not empty
      if (notEmpty(search)) {
        const fields = ["TENumber", "name", "description"];
        const searchQuery = fields.map((col) => {
          return {
            [col]: {
              [db.Sequelize.Op.like]: "%" + search + "%",
            },
          };
        });
        where = { ...where, [db.Sequelize.Op.or]: searchQuery };
      }

      const [task, count] = await Promise.all([
        TaskEvent.listAll(req, where),
        TaskEvent.countStatus(),
      ]);

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: { count, task },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description delete task with task number
 */
router.delete(
  "/:TENumber",
  auth,
  validate.task.delete(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { TENumber } = req.params;

      const where = { TENumber };
      await TaskEvent.delete(where);

      req.activity = {
        performedOnId: TENumber,
        type: "general",
        action: "TASK_DELETED",
        meta: {},
      };
      await ActivityLog.create(req);

      return res.json(
        successRespSync({
          msg: success.DELETED,
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;
