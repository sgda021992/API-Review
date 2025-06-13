const express = require("express");
const router = express.Router();
const auth = require(rootPath + "/middleware/auth");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { success } = require(rootPath + "/helpers/language");
const { logErrorOccurred } = require(rootPath + "/helpers/general");
const controller = require(rootPath + "/helpers/controller");

/**
 * @description fetch data for the conception
 */
router.get("/insemination", auth, async (req, res) => {
  try {
    const inseminationData = await controller.DataScientist.fetchInseminationData(req);

    // reformat data
    let response = {
      inseminationData,
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
router.get("/genotype-performance", auth, async (req, res) => {
  try {
    const geoTypePerformanceData = await controller.DataScientist.fetchAnimalGenotypePerformanceData(req);

    // reformat data
    let response = {
      geoTypePerformanceData,
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
