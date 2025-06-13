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

/**
 * @description get option listing from the option table
 */
router.post("/", async (req, res) => {
  try {
    let response = {};
    const { options } = req.body;
    const optionSize = options.length;

    for (let i = 0; i < optionSize; i++) {
      // check if the category is not empty
      if (!notEmpty(options[i])) continue;

      // get list of options
      let result = await db.Option.findAll({
        attributes: ["id", "name"],
        where: { groupName: options[i] },
      });
      // check if the result is not empty
      if (!notEmpty(result)) continue;
      // set response
      response[options[i]] = result;
    }

    // send response
    res.json(
      await successResp({
        msg: success.FETCH,
        data: response,
      })
    );
  } catch (err) {
    logErrorOccurred(__filename, err);
    return res.status(error.code.SERVER_ERROR).json(await errorResp());
  }
});

module.exports = router;
