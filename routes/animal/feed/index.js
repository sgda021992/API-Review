const express = require("express");
const router = express.Router();
const moment = require("moment");
const db = require(rootPath + "/models");
const auth = require(rootPath + "/middleware/auth");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { success } = require(rootPath + "/helpers/language");
const { logErrorOccurred, notEmpty } = require(rootPath + "/helpers/general");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
const { ActivityLog, AnimalFeed } = require(rootPath + "/helpers/controller");


/**
 * @description create animal feed record
 */
router.post(
  "/",
  auth,
  validate.animalfeed.post(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { animalNumber } = req.body;
      const transaction = await db.sequelize.transaction();
      try {
        let animalFeed = await AnimalFeed.create(req);
        animalFeed = await Promise.all(
          animalFeed?.map(async (row) => {
            row = await row.toJSON();
            delete row.id;
            delete row.userId;
            return row;
          })
        );

        req.activity = {
          performedOnId: animalNumber,
          type: "animal",
          action: "FEED_ADDED",
          meta: {},
        };
        await ActivityLog.create(req, transaction);

        await transaction.commit();

        return res.json(
          successRespSync({
            msg: success.CREATED,
            data: { animalFeed },
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
 * @description update animal feed record
 */
router.put(
  "/",
  auth,
  validate.animalfeed.put(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { feedNumber } = req.body;
      const transaction = await db.sequelize.transaction();

      try {
        await AnimalFeed.update(req, transaction);
        await transaction.commit();
        const animalFeed = await AnimalFeed.getDetails({ feedNumber });

        req.activity = {
          performedOnId: animalFeed.animalNumber,
          type: "animal",
          action: "FEED_UPDATED",
          meta: {},
        };
        await ActivityLog.create(req);

        return res.json(
          successRespSync({
            msg: success.UPDATED,
            data: { animalFeed },
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
 * @desc list all the feed record of the animal
 */
router.get(
  "/",
  auth,
  validate.listValidation(),
  validationErrorHandler,
  async (req, res) => {
    try {
      let { search, animal: animalNumber } = req.query;
      let where = { animalNumber };

      if (notEmpty(search)) {
        let fields = ["feedName", "feedQty", "createdAt", "note"];
        // let isNum = /^\d+$/.test(search);
        // if (!isNum) {
        // fields.push("feedName")
        const searchQuery = fields.map((col) => {
          if (col === 'feedQty') {
            return {
              [col]: {
                [db.Sequelize.Op.eq]: search,
              },
            };
          } else {
            return {
              [col]: {
                [db.Sequelize.Op.like]: "%" + search + "%",
              },
            };
          }
        });
        where = { ...where, [db.Sequelize.Op.or]: searchQuery };
        // }
      }


      const animalFeed = await AnimalFeed.listAll(req, where, search);

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: { animalFeed },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @desc fetch details of the animal feed
 */
router.get(
  "/:feedNumber",
  auth,
  validate.animalfeed.get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { feedNumber } = req.params;
      const where = { feedNumber };
      const animalFeed = await AnimalFeed.getDetails(where);

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: { animalFeed },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @desc fetch list of the animal feed of one day(specific date)
 */
router.get(
  "/:animalNumber/:date",
  auth,
  validate.animalfeed.getOne(),
  validate.listValidation(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { animalNumber, date } = req.params;
      let { search } = req.query;

      let where = [
        db.sequelize.where(
          db.sequelize.fn("DATE", db.sequelize.col("createdAt")),
          moment
            .utc(date, process.env.ACCEPT_DATE_FORMAT)
            .format(process.env.ACCEPT_DATE_FORMAT)
        ),
        { animalNumber },
      ];

      if (notEmpty(search)) {
        const fields = ["note", "feedName"];
        const searchQuery = fields.map((col) => {
          return {
            [col]: {
              [db.Sequelize.Op.like]: "%" + search + "%",
            },
          };
        });
        where.push({ [db.Sequelize.Op.or]: searchQuery });
      }

      const animalFeed = await AnimalFeed.list(req, where);

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: { animalFeed },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;
