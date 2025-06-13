const express = require("express");
const moment = require("moment");
const router = express.Router();
const db = require(rootPath + "/models");
const auth = require(rootPath + "/middleware/auth");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { success } = require(rootPath + "/helpers/language");
const { logErrorOccurred, notEmpty } = require(rootPath + "/helpers/general");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
const controller = require(rootPath + "/helpers/controller");


/**
 * @description get list of users
 */
router.get(
  "/owner",
  auth,
  async (req, res) => {
    try {
      let where = {};
      let attributes = [db.sequelize.fn('DISTINCT', db.sequelize.col('ownerName')), 'ownerName'];
      let { count: totalRows, rows } = await controller.listAllAnimals(req, attributes, where, false);
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
 * @description get list of farms
 */
router.get(
  "/farms",
  auth,
  async (req, res) => {
    try {
      let where = {};
      let attributes = [
        "farmNumber",
      ];
      const farm = require(rootPath + "/helpers/controller");
      const { count: totalRows, rows } = await farm.listAllFarms(
        req,
        attributes,
        where
      );
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
 * @description get daily updates as per dates range
 */
router.get(
  "/daily-update",
  auth,
  async (req, res) => {
    try {
      let where = {}, groupByAttr = {};
      let attributes = [];
      const { from, to, category, farmNumber, owner } = req.query;
      if (farmNumber) {
        where = {
          ...where,
          farmNumber
        }
      } if (owner) {
        where = {
          ...where,
          userId: owner
        }
      }
      if (notEmpty(from) && notEmpty(to)) {
        let categoryId = 1;
        switch (category) {
          case 'calf':
            categoryId = 1;
            attributes.push(...[[db.sequelize.fn("COUNT", db.sequelize.literal("gender")), "count"], "gender", "createdAt"])
            where = {
              ...where,
              categoryId: categoryId,
            };
            groupByAttr['groupBy'] = [[db.sequelize.fn('DATE', db.sequelize.col('createdAt')), 'createdAt'], "gender"];
            break;
          case 'animal':
            attributes.push(...[
              [db.sequelize.cast(db.sequelize.fn("DATE_FORMAT", db.sequelize.fn("FROM_DAYS", db.sequelize.fn("DATEDIFF", db.sequelize.fn("NOW"), db.sequelize.col("dob"))), '%Y'), 'integer'), "age"],
              [db.sequelize.fn("COUNT", db.sequelize.literal("dob")), "count"],
              "createdAt"
            ]);
            groupByAttr['groupBy'] = [[db.sequelize.fn('DATE', db.sequelize.col('createdAt')), 'createdAt']];
            break;
        }
      }
      where = {
        ...where,
        createdAt: {
          [db.Sequelize.Op.between]: [
            moment(from).format(process.env.ACCEPT_DATETIME_FORMAT), moment(to).format(process.env.ACCEPT_DATETIME_FORMAT)
          ],
        }
      }

      let { count: totalRows, rows } = await controller.listAllAnimals(req, attributes, where, false, true, groupByAttr);
      // re-format data if not null or empty
      if (notEmpty(rows)) {
        rows = rows.map((row) => {
          const { createdAt } = row;
          return {
            ...row.dataValues,
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
  "/:category/weekly-update",
  auth,
  async (req, res) => {
    try {
      let where = {}, groupByAttr = {};
      let attributes = [];
      const { from, to, farmNumber, owner } = req.query;
      const { category } = req.params;
      if (farmNumber) {
        where = {
          ...where,
          farmNumber
        }
      } if (owner) {
        where = {
          ...where,
          userId: owner
        }
      }
      if (notEmpty(category)) {
        let categoryId = 1;
        switch (category) {
          case 'calf':
            categoryId = 1;
            where = {
              ...where,
              categoryId: categoryId,
            };
            break;
          case 'animal':

            break;
        }
      }
      attributes.push(...[[db.sequelize.fn("COUNT", db.sequelize.literal("gender")), "count"], "createdAt"])
      groupByAttr['groupBy'] = [[db.sequelize.fn('DATE', db.sequelize.col('createdAt')), 'createdAt']];

      var startOfWeek = moment().startOf('week').toDate();
      var endOfWeek = moment().endOf('week').toDate();
      where = {
        ...where,
        createdAt: {
          [db.Sequelize.Op.between]: [
            startOfWeek, endOfWeek
          ],
        }
      }

      let { count: weeklyTotalRows, rows: weeklyRows } = await controller.listAllAnimals(req, attributes, where, false, true, groupByAttr);
      if (notEmpty(from) && notEmpty(to)) {
        where = {
          ...where,
          createdAt: {
            [db.Sequelize.Op.between]: [
              moment(from).format(process.env.ACCEPT_DATETIME_FORMAT), moment(to).format(process.env.ACCEPT_DATETIME_FORMAT)
            ],
          }
        }
      }
      let { count: dailyTotalRows, rows: dailyRows } = await controller.listAllAnimals(req, attributes, where, false, true, groupByAttr);
      // re-format data if not null or empty
      if (notEmpty(weeklyRows)) {
        weeklyRows = weeklyRows.map((row) => {
          const { createdAt } = row;
          return {
            ...row.dataValues,
            ...(moment(createdAt, process.env.DB_DATE, true).isValid()
              ? { createdAt: moment(createdAt).format(process.env.DISPLAY_DATE_FORMAT) }
              : null)
          };
        });
      }
      if (notEmpty(dailyRows)) {
        dailyRows = dailyRows.map((row) => {
          const { createdAt } = row;
          return {
            ...row.dataValues,
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
 * 
 */
router.get("/milk-growth",
  auth,
  async (req, res) => {
    try {
      let { limit = 1000, col, desc, sDate, eDate } = req.query;
      limit = parseInt(limit);
      let where = {
        createdAt: {
          [db.Sequelize.Op.between]: [
            moment.utc(sDate, process.env.DB_DATE).format(process.env.DB_DATE).toString(),
            moment.utc(eDate, process.env.DB_DATE).format(process.env.DB_DATE).toString(),
          ],
        }
      }
      const milkProduction = await controller.MilkProduction.fetchMilkProductionReport(req, where);
      let response = {
        milkProduction,
        // embryoData
      };
      // send response back
      return res.json(
        successRespSync({
          msg: success.FETCHED,
          data: {
            ...response,
          },
        })
      );

    } catch (err) {
      console.log("err", err)
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  });


/**
 * @description get new calves 
 */
router.get(
  "/:category",
  auth,
  async (req, res) => {
    try {
      let where = {};
      let attributes = [
        "animalNumber",
        "farmNumber",
        "tagType",
        "tagNumber",
        "registrationNumber",
        "birthWeight",
        "birthEase",
        "birthFarmId",
        "ownerName",
        "sirePubId",
        "damPubId",
        "surrogateDamPubId",
        "breedId",
        "breed",
        "conceptionMethod",
        "gender",
        "dob",
        "operator",
        "animalRemovedFarmId",
        "animalRemovalDate",
        "removedAnimalDestination",
        "animalRemovalReason",
        "name",
        "trackingNumber",
        "brand",
        "tattoo",
        "hornStatus",
        "countryId",
        "origin",
        "previousOwnerName",
        "twin",
        "breedAssociationName",
        "breedAssociationRegNo",
        "breeder",
        "note",
        "steer",
        "status",
        "categoryId",
        "createdAt",
      ];
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
        where = {
          ...where,
          userId: owner
        }
      }
      switch (req.params.category) {
        case 'calf':
          where = { ...where, categoryId: '1' };
          break;
        case 'animal':
          outputObj['totalAnimal'] = 0
      }
      const { count: totalRows, rows } = await controller.listAllAnimals(req, attributes, where, false);

      if (outputObj['totalAnimal'] !== undefined) {
        outputObj['totalAnimal'] = rows.length
      }
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
 * @desc get all health record details of the animal with pagination
 */

router.get(
  "/animal/disease",
  auth,
  async (req, res) => {
    try {
      const attributes = ["animalNumber", "attendingVeterinarian", "diagnosis", "drugName", "drugWithdrawPeriod", "treatmentDate"];
      let where = null;
      const { search } = req.query;
      if (notEmpty(search)) {
        const fields = [
          "animalNumber",
          "attendingVeterinarian",
          "diagnosis",
          "drugName",
          "drugWithdrawPeriod",
        ];
        const searchQuery = fields.map((col) => {
          return {
            [col]: {
              [db.Sequelize.Op.like]: "%" + search + "%",
            },
          };
        });
        where = { ...where, [db.Sequelize.Op.or]: searchQuery };
      }
      let healthRecord =
        await controller.AnimalHealthRecord.getAllHealthRecordDetails(
          req,
          attributes,
          where
        );
        const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
        const { respError } = require(rootPath + "/helpers/response/" + language);

      return res.json(
        successRespSync({
          msg: healthRecord == null ? respError.NOT_FOUND : success.FETCH,
          data: {
            healthRecord,
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
 * 
 */


module.exports = router;
