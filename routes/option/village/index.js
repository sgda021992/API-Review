const express = require("express");
const router = express.Router();
// loading models
const db = require(rootPath + "/models");
const auth = require(rootPath + "/middleware/auth");
const { successResp, errorResp, successRespSync } = require(rootPath +
  "/helpers/api");
const { error, success } = require(rootPath + "/helpers/language"); // constant messages
const { logErrorOccurred, notEmpty, removeEmptyValuesFromObject } = require(rootPath + "/helpers/general"); // constant messages
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");

// load helper controller
const controller = require(rootPath + "/helpers/controller");

/**
 * @description get option villages according to the country id and state id
 */
router.get(
  "/",
  validate.world.village(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { state: stateId } = req.query;
      // create where condition
      where = { stateId };
      // remove empty values
      removeEmptyValuesFromObject(where);
      // return res.json(where);
      const villages = await controller.Village.getVillages(req,where);

      // send response
      res.json(
        await successResp({
          msg: success.FETCH,
          data: villages,
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return res.status(error.code.SERVER_ERROR).json(await errorResp());
    }
  }
);

module.exports = router;
