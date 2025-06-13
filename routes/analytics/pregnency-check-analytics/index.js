const express = require("express");
const moment = require("moment");
const router = express.Router();
const db = require(rootPath + "/models");
const auth = require(rootPath + "/middleware/auth");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { success } = require(rootPath + "/helpers/language");
const { logErrorOccurred, notEmpty } = require(rootPath + "/helpers/general");
// const validate = require(rootPath + "/helpers/validation");
// const validationErrorHandler = require(rootPath +
//   "/middleware/validation_error_handler");
const { PregnencyCheck } = require(rootPath + "/helpers/controller");

/**
 * @description get new calves 
 */
router.get(
  "/history",
  auth,
  async (req, res) => {
    try {
      let where = {}, pregnancyWhere = {};
      let attributes = [
        "animalNumber",
        "createdAt"
      ];
      const include = []
      const { farmNumber, owner } = req.query;
      const outputObj = {
        lastYearReg: 0,
        lastYearPer: 0,
        lastQuaterReg: 0,
        lastQuaterPer: 0,
        lastMonthReg: 0,
        lastMonthPer: 0,
        lastWeekReg: 0,
        lastWeekPer: 0
      };
      if (farmNumber) {
        where = {
          ...where,
          farmNumber
        }
      } if (owner) {
        pregnancyWhere = {
          ...pregnancyWhere,
          userId: owner
        }
      }

      pregnancyWhere = {
        ...pregnancyWhere,
        conceptionSuccess: 1
      }

      include.push({
        model: db.Animal,
        as: 'animal',
        attributes: [
          "animalNumber",
          "farmNumber",
          "categoryId",
        ],
        where: where
      })

      const { total_rows: totalRows, rows } = await PregnencyCheck.fetchPregnencyCheckData(req, pregnancyWhere, include, attributes);

      outputObj['totalAnimal'] = totalRows
      const lastYearDate = {
        startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1, 0, 1)),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1, 11, 31)),
        startLastQuarter: new Date(new Date().getFullYear(), Math.floor((new Date().getMonth() / 3)) * 3 - 3, 1),
        sinceLastMonth: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        sinceLastWeek: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 7)
      }
      const lastYearRec = [], currentYearRec = [],
        lastQuaterRec = [], currentQuaterRec = [],
        lastMonthRec = [], currentMonthRec = [],
        lastWeekRec = [], currentWeekRec = [];
      const currentQuater = new Date(moment().startOf('quarter'));
      const currentMonth = new Date(moment().startOf('month'));
      const currentWeek = new Date(moment().startOf('week'));
      rows.map((data) => {
        if (data.createdAt >= lastYearDate.startDate) { outputObj.lastYearReg++ }
        if (data.createdAt >= lastYearDate.startLastQuarter) { outputObj.lastQuaterReg++ }
        if (data.createdAt >= lastYearDate.sinceLastMonth) { outputObj.lastMonthReg++ }
        if (data.createdAt >= lastYearDate.sinceLastWeek) { outputObj.lastWeekReg++ }

        //year comparision data
        if (data.createdAt >= lastYearDate.startDate && data.createdAt <= lastYearDate.endDate) {
          lastYearRec.push(data)
        } if (data.createdAt >= new Date(new Date().getFullYear(), 0, 1)) {
          currentYearRec.push(data)
        }
        //quater comparision data
        if (data.createdAt >= lastYearDate.startLastQuarter && data.createdAt <= currentQuater) {
          lastQuaterRec.push(data)
        } if (data.createdAt >= currentQuater) {
          currentQuaterRec.push(data)
        }
        //month comparision data
        if (data.createdAt >= lastYearDate.sinceLastMonth && data.createdAt <= currentMonth) {
          lastMonthRec.push(data)
        } if (data.createdAt >= currentMonth) {
          currentMonthRec.push(data)
        }
        //week comparision data
        if (data.createdAt >= lastYearDate.sinceLastWeek && data.createdAt <= currentWeek) {
          lastWeekRec.push(data)
        } if (data.createdAt >= currentWeek) {
          currentWeekRec.push(data)
        }
      })
      outputObj.lastYearPer = (currentYearRec.length - lastYearRec.length) / (lastYearRec.length ? lastYearRec.length : 1) * 100
      outputObj.lastQuaterPer = (currentQuaterRec.length - lastQuaterRec.length) / (lastQuaterRec.length ? lastQuaterRec.length : 1) * 100
      outputObj.lastMonthPer = (currentMonthRec.length - lastMonthRec.length) / (lastMonthRec.length ? lastMonthRec.length : 1) * 100
      outputObj.lastWeekPer = (currentWeekRec.length - lastWeekRec.length) / (lastWeekRec.length ? lastWeekRec.length : 1) * 100

      return res.json(
        successRespSync({
          msg: success.FETCHED,
          rows: totalRows,
          data: outputObj,
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description get daily updates as per dates range
 */
router.get(
  "/daily-update",
  auth,
  async (req, res) => {
    try {
      let where = {}, pregnanacyWhere = {}, groupByAttr = {};
      let attributes = [], include = [];
      const { from, to, farmNumber, owner } = req.query;
      if (farmNumber) {
        where = {
          ...where,
          farmNumber
        }
      } if (owner) {
        pregnanacyWhere = {
          ...pregnanacyWhere,
          userId: owner
        }
      }
      attributes.push(...[
        "pregnancyCheckDate",
        [db.sequelize.fn("COUNT", db.sequelize.fn("DATE", db.sequelize.col("AnimalPregnancyCheck.pregnancyCheckDate"))), "count"],
        [db.sequelize.fn("DATE", db.sequelize.col("AnimalPregnancyCheck.createdAt")), "createdAt"],
        [
          db.sequelize.fn("TIMESTAMPDIFF",
            db.sequelize.literal('MONTH'),
            db.sequelize.fn("DATE", db.sequelize.col("AnimalPregnancyCheck.pregnancyCheckDate")),
            db.sequelize.fn('CURDATE')), "month"
        ],
        [
          db.sequelize.fn("TIMESTAMPDIFF",
            db.sequelize.literal('YEAR'),
            db.sequelize.fn("DATE", db.sequelize.col("AnimalPregnancyCheck.pregnancyCheckDate")),
            db.sequelize.fn('CURDATE')), "year"
        ]
      ]);
      groupByAttr['groupBy'] = [[db.sequelize.fn('DATE', db.sequelize.col('AnimalPregnancyCheck.pregnancyCheckDate')), 'pregnancyCheckDate']];
      pregnanacyWhere = {
        ...pregnanacyWhere,
        conceptionSuccess: 1
      }
      if (notEmpty(from) && notEmpty(to)) {
        pregnanacyWhere = {
          ...pregnanacyWhere,
          pregnancyCheckDate: {
            [db.Sequelize.Op.between]: [
              moment(from).format(process.env.ACCEPT_DATETIME_FORMAT), moment(to).format(process.env.ACCEPT_DATETIME_FORMAT)
            ],
          }
        }
      }

      include.push({
        model: db.Animal,
        as: 'animal',
        attributes: [],
        where: where
      })

      let { num_rows: totalRows, rows } = await PregnencyCheck.fetchPregnencyCheckData(req, pregnanacyWhere, include, attributes, groupByAttr);
      // re-format data if not null or empty
      if (notEmpty(rows)) {
        rows = rows.map((row) => {
          const { createdAt } = row;
          return {
            ...row,
            ...(moment(createdAt, process.env.DB_DATE, true).isValid()
              ? { createdAt: moment(createdAt).format(process.env.DISPLAY_DATE_FORMAT) }
              : null)
          };
        });
      }
      return res.json(
        successRespSync({
          msg: success.FETCHED,
          rows: totalRows,
          data: rows,
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description get weeekly updates as per dates range, farm and owner
 */
router.get(
  "/weekly-update",
  auth,
  async (req, res) => {
    try {
      let where = {}, groupByAttr = {}, pregnanacyWhere = {};
      let attributes = [], include = [];
      const { from, to, farmNumber, owner } = req.query;
      if (farmNumber) {
        where = {
          ...where,
          farmNumber
        }
      } if (owner) {
        pregnanacyWhere = {
          ...pregnanacyWhere,
          userId: owner
        }
      }
      attributes.push(...[
        [db.sequelize.fn("COUNT", db.sequelize.fn("DATE", db.sequelize.col("AnimalPregnancyCheck.createdAt"))), "count"],
        [db.sequelize.fn("DATE", db.sequelize.col("AnimalPregnancyCheck.createdAt")), "createdAt"]
      ]);
      groupByAttr['groupBy'] = [[db.sequelize.fn('DATE', db.sequelize.col('AnimalPregnancyCheck.createdAt')), 'pregnancyCheckDate']];
      pregnanacyWhere = {
        ...pregnanacyWhere,
        conceptionSuccess: 1
      }
      var startOfWeek = moment().startOf('week').toDate();
      var endOfWeek = moment().endOf('week').toDate();

      pregnanacyWhere = {
        ...pregnanacyWhere,
        createdAt: {
          [db.Sequelize.Op.between]: [
            startOfWeek, endOfWeek
          ],
        }
      }

      include.push({
        model: db.Animal,
        as: 'animal',
        attributes: [],
        where: where
      })

      let { num_rows: weeklyTotalRows, rows: weeklyRows } = await PregnencyCheck.fetchPregnencyCheckData(req, pregnanacyWhere, include, attributes, groupByAttr);
      if (notEmpty(from) && notEmpty(to)) {
        pregnanacyWhere = {
          ...pregnanacyWhere,
          createdAt: {
            [db.Sequelize.Op.between]: [
              moment(from).format(process.env.ACCEPT_DATETIME_FORMAT), moment(to).format(process.env.ACCEPT_DATETIME_FORMAT)
            ],
          }
        }
      }
      let { num_rows: dailyTotalRows, rows: dailyRows } = await PregnencyCheck.fetchPregnencyCheckData(req, pregnanacyWhere, include, attributes, groupByAttr);
      // re-format data if not null or empty
      if (notEmpty(dailyRows)) {
        dailyRows = dailyRows.map((row) => {
          const { createdAt } = row;
          return {
            ...row,
            ...(moment(createdAt, process.env.DB_DATE, true).isValid()
              ? { createdAt: moment(createdAt).format(process.env.DISPLAY_DATE_FORMAT) }
              : null)
          };
        });
      } if (notEmpty(weeklyRows)) {
        weeklyRows = weeklyRows.map((row) => {
          const { createdAt } = row;
          return {
            ...row,
            ...(moment(createdAt, process.env.DB_DATE, true).isValid()
              ? { createdAt: moment(createdAt).format(process.env.DISPLAY_DATE_FORMAT) }
              : null)
          };
        });
      }
      return res.json(
        successRespSync({
          msg: success.FETCHED,
          rows: weeklyTotalRows + dailyTotalRows,
          data: { dailyRows, weeklyRows },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @desc get all health record details of the animal with pagination
 */

router.get(
  "/",
  auth,
  async (req, res) => {
    try {
      const attributes = [
        [db.sequelize.fn("COUNT", db.sequelize.col("AnimalPregnancyCheck.animalNumber")), "pregnanyFrequency"],
        "pregnancyCheckDate",
        "AnimalPregnancyCheck.animalNumber"
      ];
      let where = {}, groupByAttr = {}, include = [], pregnanacyWhere = {};
      const { farmNumber, owner } = req.query;
      if (farmNumber) {
        where = {
          ...where,
          farmNumber
        }
      } if (owner) {
        pregnanacyWhere = {
          ...pregnanacyWhere,
          userId: owner
        }
      }
      pregnanacyWhere = { ...pregnanacyWhere, conceptionSuccess: 1 };
      include.push({
        model: db.Animal,
        as: 'animal',
        attributes: [],
        where: where
      })
      groupByAttr['groupBy'] = ["AnimalPregnancyCheck.animalNumber"];

      let pregnencyReport = await PregnencyCheck.fetchPregnencyCheckData(req, pregnanacyWhere, include, attributes, groupByAttr);
      const { respError } = require(rootPath + "/helpers/response/" + req.headers.language ? req.headers.language : 'en');
      return res.json(
        successRespSync({
          msg: pregnencyReport == null ? respError.NOT_FOUND : success.FETCH,
          data: {
            pregnencyReport,
          },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;
