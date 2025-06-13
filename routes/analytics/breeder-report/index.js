const express = require("express");
const router = express.Router();
const auth = require(rootPath + "/middleware/auth");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { success } = require(rootPath + "/helpers/language");
const { logErrorOccurred } = require(rootPath + "/helpers/general");
const controller = require(rootPath + "/helpers/controller");
const { notEmpty } = require(rootPath + "/helpers/general");


/**
 * @description fetch data for the conception
 */
router.get("/conception", auth, async (req, res) => {
  try {
    const conceptionData = await controller.BreederReport.fetchConceptionData(req);

    // reformat data
    let response = {
      conceptionData,
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
router.get("/semen", auth, async (req, res) => {
  try {
    const semenData = await controller.BreederReport.fetchSemenData(req, 'male');

    // reformat data
    let response = {
      semenData,
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
router.get("/embryo", auth, async (req, res) => {
  try {
    const embryoData = await controller.BreederReport.fetchSemenData(req, 'female');

    // reformat data
    let response = {
      embryoData,
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
 * @description fetch data for the pregnency-check
 */
router.get("/pregnency-check", auth, async (req, res) => {
  try {
    const pregrencyCheckData = await controller.BreederReport.fetchPregnencyCheckData(req);

    // reformat data
    let response = {
      pregrencyCheckData,
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
 * @description fetch data for the birth-info
 */
router.get("/birth-info", auth, async (req, res) => {
  try {
    const birthInfoData = await controller.BreederReport.fetchBirthInfoData(req);

    // reformat data
    let response = {
      birthInfoData,
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
 * @description fetch data for the total pregrant and new born
 */
router.get("/counts", auth, async (req, res) => {
  try {
    const { farm: farmNumber } = req.query;
    let query = {}
    if (farmNumber !== null && notEmpty(farmNumber)) {
      query = { where: { farmNumber: farmNumber } }
    }
    const result = await Promise.all(
      [
        controller.calfCount(query),
        controller.BreederReport.fetchPregrentCountData(req)
      ]
    )

    // reformat data
    let response = {
      total_pregnent: result[1],
      new_born: result[0],
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



module.exports = router;
