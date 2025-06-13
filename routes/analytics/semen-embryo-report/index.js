const express = require("express");
const router = express.Router();

const auth = require(rootPath + "/middleware/auth");

const db = require(rootPath + "/models");

const { SAutomationSire, SAutomationStraw, ActivityLog } = require(rootPath +
  "/helpers/controller");

const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { success } = require(rootPath + "/helpers/language");
const { logErrorOccurred, notEmpty, removeEmptyValuesFromObject, getFormattedId } = require(rootPath + "/helpers/general");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");

const moment = require("moment");

const controller = require(rootPath + "/helpers/controller");


/**
 * @description fetch data for the semen
 */

//  router.get("/", auth, async (req, res)
router.get("/semen", auth, async (req, res) => {
  try {
    const semenData = await controller.SemenEmbryoReport.fetchSemenData(req);
    // const embryoData = await controller.SemenEmbryoReport.fetchEmbryoData(req);


    // reformat data
    let response = {
      semenData,
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
 * @description fetch data for the semen
 */

//  router.get("/", auth, async (req, res)
router.get("/embryo", auth, async (req, res) => {
  try {
    // const semenData = await controller.SemenEmbryoReport.fetchSemenData(req);
    const embryoData = await controller.SemenEmbryoReport.fetchEmbryoData(req);


    // reformat data
    let response = {
      // semenData,
      embryoData
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


router.get("/semen-prod", auth, async (req, res) => {

  const { sDate, eDate } = req.query;
  try {
    let where = {
    }
    let where2 = {
    }
    if (sDate && eDate) {
      where = {
        ...where,
        createdAt: {
          [db.Sequelize.Op.between]: [
            moment.utc(sDate, process.env.DB_DATE).format(process.env.DB_DATE).toString(),
            moment.utc(eDate, process.env.DB_DATE).format(process.env.DB_DATE).toString(),
          ],
        }
      }
      where2 = {
        ...where2,
        createdAt: {
          [db.Sequelize.Op.between]: [
            moment.utc(sDate, process.env.DB_DATE).subtract(1, 'W').format(process.env.DB_DATE).toString(),
            moment.utc(eDate, process.env.DB_DATE).subtract(1, 'W').format(process.env.DB_DATE).toString(),
          ],
        }
      }

    }

    const lastWeek = await controller.SemenEmbryoReport.fetchSemenReport(req, where2);
    const thisWeek = await controller.SemenEmbryoReport.fetchSemenReport(req, where);

    let response = {
      // semenReport
      thisWeek,
      lastWeek
    }
    console.log();
    return res.json(
      successRespSync({
        msg: success.FETCHED,
        data: {
          ...response
        }
      })
    )
  } catch (err) {
    console.log("err", err);
    logErrorOccurred(__filename, err);
    return serverError(res);
  }
})


router.get("/semen-sale", auth, async (req, res) => {

  const { sDate, eDate } = req.query;
  try {
    let where = {}
    let where2 = {}
    if (sDate && eDate) {
      where = {
        // name:"Product 2",
        createdAt: {
          [db.Sequelize.Op.between]: [
            moment.utc(sDate, process.env.DB_DATE).format(process.env.DB_DATE).toString(),
            moment.utc(eDate, process.env.DB_DATE).format(process.env.DB_DATE).toString(),
          ],
        }
      }
      where2 = {
        ...where2,
        createdAt: {
          [db.Sequelize.Op.between]: [
            moment.utc(sDate, process.env.DB_DATE).subtract(1, 'W').format(process.env.DB_DATE).toString(),
            moment.utc(eDate, process.env.DB_DATE).subtract(1, 'W').format(process.env.DB_DATE).toString(),
          ],
        }
      }
    }
    const thisWeek = await controller.SemenEmbryoReport.fetchSemenSaleReport(req, where);
    const lastWeek = await controller.SemenEmbryoReport.fetchSemenSaleReport(req, where2);
    let response = {
      thisWeek,
      lastWeek
    }
    return res.json(
      successRespSync({
        msg: success.FETCHED,
        data: {
          ...response
        }
      })
    )
  } catch (err) {
    console.log("err", err);
    logErrorOccurred(__filename, err);
    return serverError(res);
  }
})


router.get("/embryo-prod", auth, async (req, res) => {

  const { sDate, eDate } = req.query;
  try {
    let where={}
    let where2 = {};
    if (sDate && eDate) {
    where = {
      name: "Embryo",
      createdAdt: {
        [db.Sequelize.Op.between]: [
          moment.utc(sDate, process.env.DB_DATE).format(process.env.DB_DATE).toString(),
          moment.utc(eDate, process.env.DB_DATE).format(process.env.DB_DATE).toString(),
        ],
      }
    }
    where2 = {
      ...where2,
      createdAt: {
        [db.Sequelize.Op.between]: [
          moment.utc(sDate, process.env.DB_DATE).subtract(1, 'W').format(process.env.DB_DATE).toString(),
          moment.utc(eDate, process.env.DB_DATE).subtract(1, 'W').format(process.env.DB_DATE).toString(),
        ],
      }
    }
  }

    const thisWeek = await controller.SemenEmbryoReport.fetchEmbryoReport(req, where);
    const lastWeek = await controller.SemenEmbryoReport.fetchEmbryoReport(req, where2);
    let response = {
      thisWeek,
      lastWeek
    }
    console.log();
    return res.json(
      successRespSync({
        msg: success.FETCHED,
        data: {
          ...response
        }
      })
    )
  } catch (err) {
    console.log("err", err);
    logErrorOccurred(__filename, err);
    return serverError(res);
  }
})

router.get("/embryo-sale", auth, async (req, res) => {

  const { sDate, eDate } = req.query;
  try {
    let where = {};
    let where2 = {};
    if (sDate && eDate) {
      where = {
        // name:"Product 2",
        createdAt: {
          [db.Sequelize.Op.between]: [
            moment.utc(sDate, process.env.DB_DATE).format(process.env.DB_DATE).toString(),
            moment.utc(eDate, process.env.DB_DATE).format(process.env.DB_DATE).toString(),
          ],
        }
      }
      where2 = {
        ...where2,
        createdAt: {
          [db.Sequelize.Op.between]: [
            moment.utc(sDate, process.env.DB_DATE).subtract(1, 'W').format(process.env.DB_DATE).toString(),
            moment.utc(eDate, process.env.DB_DATE).subtract(1, 'W').format(process.env.DB_DATE).toString(),
          ],
        }
      }
    }
    const thisWeek = await controller.SemenEmbryoReport.fetchEmbryoSaleReport(req, where);
    const lastWeek = await controller.SemenEmbryoReport.fetchEmbryoSaleReport(req, where2);
    let response = {
       thisWeek,
       lastWeek
    }

    return res.json(
      successRespSync({
        msg: success.FETCHED,
        data: {
          ...response
        }
      })
    )
  } catch (err) {
    console.log("err", err);
    logErrorOccurred(__filename, err);
    return serverError(res);
  }
})


router.get("/table", auth, async (req, res) => {

  
  try {
    let where = {}
    
    const tableReport = await controller.SemenEmbryoReport.fetchTableData(req, where);
    let response = {
     
      tableReport
    }
    console.log();
    return res.json(
      successRespSync({
        msg: success.FETCHED,
        data: {
          ...response
        }
      })
    )
  } catch (err) {
    console.log("err", err);
    logErrorOccurred(__filename, err);
    return serverError(res);
  }
})

// fetchSemenStrawReport
router.get('/semenProd', auth, async (req, res) => {

  // const { sDate, eDate } = req.body;
  try {
    let where1 = {
      createdAt: {
        [db.Sequelize.Op.between]: [
          moment().subtract(1, 'weeks').startOf('week').format(process.env.DB_DATE).toString(),
          moment().subtract(1, 'weeks').endOf('week').format(process.env.DB_DATE).toString(),
        ],
      }
    };
    let where2={
      createdAt: {
        [db.Sequelize.Op.between]: [
          moment().subtract(1, 'months').startOf('month').format(process.env.DB_DATE).toString(),
          moment().subtract(1, 'months').endOf('month').format(process.env.DB_DATE).toString(),
        ],
      }
    }
    let where3={
      createdAt: {
        [db.Sequelize.Op.between]: [
          moment().subtract(1, 'year').startOf('year').format(process.env.DB_DATE).toString(),
          moment().subtract(1, 'year').endOf('year').format(process.env.DB_DATE).toString(),
        ],
      }
    }
    let where4={
      createdAt: {
        [db.Sequelize.Op.between]: [
          moment().subtract(6, 'months').startOf('month').format(process.env.DB_DATE).toString(),
          moment().subtract(3, 'months').endOf('month').format(process.env.DB_DATE).toString(),
        ],
      }
    }


    let cWeek={
      createdAt: {
        [db.Sequelize.Op.between]: [
          moment().startOf('week').format(process.env.DB_DATE).toString(),
          moment().endOf('week').format(process.env.DB_DATE).toString(),
        ],
      }
    }



    let cMonth={
      createdAt: {
        [db.Sequelize.Op.between]: [
          moment().startOf('month').format(process.env.DB_DATE).toString(),
          moment().endOf('month').format(process.env.DB_DATE).toString(),
        ],
      }
    }

    let cYear ={
        createdAt: {
          [db.Sequelize.Op.between]: [
            moment().startOf('year').format(process.env.DB_DATE).toString(),
            moment().endOf('year').format(process.env.DB_DATE).toString(),
          ],
        }
    }
    
  let cQuarter={
    createdAt: {
      [db.Sequelize.Op.between]: [
        moment().subtract(3, 'months').startOf('month').format(process.env.DB_DATE).toString(),
        moment().subtract(1, 'months').endOf('month').format(process.env.DB_DATE).toString(),
      ],
    }
  }

    const lastWeek = await controller.SemenEmbryoReport.fetchSemenStrawReport(req, where1);
    const lastMonth = await controller.SemenEmbryoReport.fetchSemenStrawReport(req, where2);
    const lastYear = await controller.SemenEmbryoReport.fetchSemenStrawReport(req, where3);
    const lastQuarter =await controller.SemenEmbryoReport.fetchSemenStrawReport(req, where4);


    const currentWeek =await controller.SemenEmbryoReport.fetchSemenStrawReport(req, cWeek);
    const currentMonth = await controller.SemenEmbryoReport.fetchSemenStrawReport(req, cMonth);
    const currentYear = await controller.SemenEmbryoReport.fetchSemenStrawReport(req, cYear);
    const currentQuarter = await controller.SemenEmbryoReport.fetchSemenStrawReport(req, cQuarter);

    let response = {
      lastWeekCount:lastWeek,
      lastWeekPct:(lastWeek/currentWeek)*100,
      lastMonthCount:lastMonth,
      lastMonthPct:(lastMonth/currentMonth)*100,
      lastYearCount:lastYear,
      lastYearPct:(lastYear/currentYear)*100,
      lastQuarterCount:lastQuarter,
      lastQuarterPct:(lastQuarter/currentQuarter)*100,
    }
    return res.json(
      successRespSync({
        msg: success.FETCHED,
        data: {
          ...response
        }
      })
    )
  } catch (err) {
    console.log("err", err);
    logErrorOccurred(__filename, err);
    return serverError(res);
  }
})


// fetchEmbryoStrawReport
router.get('/embryoProd', auth, async (req, res) => {

  try {
    let where1 = {
      createdAt: {
        [db.Sequelize.Op.between]: [
          moment().subtract(1, 'weeks').startOf('week').format(process.env.DB_DATE).toString(),
          moment().subtract(1, 'weeks').endOf('week').format(process.env.DB_DATE).toString(),
        ],
      }
    };
    let where2={
      createdAt: {
        [db.Sequelize.Op.between]: [
          moment().subtract(1, 'months').startOf('month').format(process.env.DB_DATE).toString(),
          moment().subtract(1, 'months').endOf('month').format(process.env.DB_DATE).toString(),
        ],
      }
    }
    let where3={
      createdAt: {
        [db.Sequelize.Op.between]: [
          moment().subtract(1, 'year').startOf('year').format(process.env.DB_DATE).toString(),
          moment().subtract(1, 'year').endOf('year').format(process.env.DB_DATE).toString(),
        ],
      }
    }
    let where4={
      createdAt: {
        [db.Sequelize.Op.between]: [
          moment().subtract(6, 'months').startOf('month').format(process.env.DB_DATE).toString(),
          moment().subtract(3, 'months').endOf('month').format(process.env.DB_DATE).toString(),
        ],
      }
    }


    let cWeek={
      createdAt: {
        [db.Sequelize.Op.between]: [
          moment().startOf('week').format(process.env.DB_DATE).toString(),
          moment().endOf('week').format(process.env.DB_DATE).toString(),
        ],
      }
    }



    let cMonth={
      createdAt: {
        [db.Sequelize.Op.between]: [
          moment().startOf('month').format(process.env.DB_DATE).toString(),
          moment().endOf('month').format(process.env.DB_DATE).toString(),
        ],
      }
    }

    let cYear ={
        createdAt: {
          [db.Sequelize.Op.between]: [
            moment().startOf('year').format(process.env.DB_DATE).toString(),
            moment().endOf('year').format(process.env.DB_DATE).toString(),
          ],
        }
    }
    
  let cQuarter={
    createdAt: {
      [db.Sequelize.Op.between]: [
        moment().subtract(3, 'months').startOf('month').format(process.env.DB_DATE).toString(),
        moment().subtract(1, 'months').endOf('month').format(process.env.DB_DATE).toString(),
      ],
    }
  }

    const lastWeek = await controller.SemenEmbryoReport.fetchEmbryoStrawReport(req, where1);
    const lastMonth = await controller.SemenEmbryoReport.fetchEmbryoStrawReport(req, where2);
    const lastYear = await controller.SemenEmbryoReport.fetchEmbryoStrawReport(req, where3);
    const lastQuarter =await controller.SemenEmbryoReport.fetchEmbryoStrawReport(req, where4);
    const currentWeek =await controller.SemenEmbryoReport.fetchSemenStrawReport(req, cWeek);
    const currentMonth = await controller.SemenEmbryoReport.fetchSemenStrawReport(req, cMonth);
    const currentYear = await controller.SemenEmbryoReport.fetchSemenStrawReport(req, cYear);
    const currentQuarter = await controller.SemenEmbryoReport.fetchSemenStrawReport(req, cQuarter);

    let response = {
      lastWeekCount:lastWeek,
      lastWeekPct:(lastWeek/currentWeek)*100,
      lastMonthCount:lastMonth,
      lastMonthPct:(lastMonth/currentMonth)*100,
      lastYearCount:lastYear,
      lastYearPct:(lastYear/currentYear)*100,
      lastQuarterCount:lastQuarter,
      lastQuarterPct:(lastQuarter/currentQuarter)*100,
    }
    return res.json(
      successRespSync({
        msg: success.FETCHED,
        data: {
          ...response
        }
      })
    )
  } catch (err) {
    console.log("err", err);
    logErrorOccurred(__filename, err);
    return serverError(res);
  }
})


module.exports = router;
