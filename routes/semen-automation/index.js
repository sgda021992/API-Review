const express = require("express");
const moment = require("moment");
const router = express.Router();
// loading models
const db = require(rootPath + "/models");
// loading middleware
const auth = require(rootPath + "/middleware/auth");
// loading helpers
const { successResp, successRespSync, serverError } = require(rootPath +
  "/helpers/api");
const { error, success } = require(rootPath + "/helpers/language"); // constant messages
const {
  logErrorOccurred,
  notEmpty,
  removeEmptyValuesFromObject,
} = require(rootPath + "/helpers/general"); // constant messages
// validations
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
// load helper controller
const { SemenAutomation } = require(rootPath + "/helpers/controller");

// load sub routes
router.use("/sire", require("./sire"));
router.use("/approval", require("./approval"));
router.use("/collection", require("./collection"));
router.use("/straw", require("./straw"));
router.use("/pack", require("./pack"));
router.use("/postage", require("./postage"));

/**
 * @description semen automation registration
 */
router.post(
  "/",
  auth,
  // validate.animalconception.post(),
  // validationErrorHandler,
  async (req, res) => {
    try {
      // return res.json(req.body);
      const transaction = await db.sequelize.transaction();

      try {
        const sire = await SemenAutomation.addSire(req, transaction);
        const approval = await SemenAutomation.addApproval(req, transaction);
        const straws = await SemenAutomation.addStraws(req, transaction);
        const pack = await SemenAutomation.addPack(req, transaction);
        const postage = await SemenAutomation.addPostage(req, transaction);
        const collection = await SemenAutomation.addCollection(
          req,
          transaction
        );

        await transaction.commit();

        // send response formatted response back
        return res.json(
          await successResp({
            msg: success.REGISTERED,
            data: {
              SemenAutomation: {
                sire,
                approval,
                straws,
                pack,
                postage,
                collection,
              },
            },
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

module.exports = router;
