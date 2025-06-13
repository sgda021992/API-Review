const express = require("express");
const router = express.Router();
// loading models
const db = require(rootPath + "/models");
const auth = require(rootPath + "/middleware/auth");
const { successResp, errorResp, successRespSync } = require(rootPath +
  "/helpers/api");
const { error, success } = require(rootPath + "/helpers/language"); // constant messages
const { logErrorOccurred, notEmpty } = require(rootPath + "/helpers/general"); // constant messages
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");

// load helper controller
const controller = require(rootPath + "/helpers/controller");

/**
 * @description get option listing from the option table
 */
router.get("/", async (req, res) => {
  try {
    const countries = await controller.Country.getCountries(req);

    // send response
    res.json(
      await successResp({
        msg: success.FETCH,
        data: countries,
      })
    );
  } catch (err) {
    logErrorOccurred(__filename, err);
    return res.status(error.code.SERVER_ERROR).json(await errorResp());
  }
});

module.exports = router;
