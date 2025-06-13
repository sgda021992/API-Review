const express = require("express");
const router = express.Router();
const db = require(rootPath + "/models");
const auth = require(rootPath + "/middleware/auth");
const hasPermission = require(rootPath + "/middleware/permission");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { error, success } = require(rootPath + "/helpers/language");
const { logErrorOccurred, notEmpty } = require(rootPath + "/helpers/general");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
// load helper controller
const { AnimalActivityLog, ActivityLog } = require(rootPath +
  "/helpers/controller");

/**
 * @desc fetch list of animal activity logs by animal number
 */
router.get(
  "/:animalNumber",
  auth,
  // hasPermission,
  validate.listValidation(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { animalNumber: performedOnId } = req.params;
      const { search } = req.query;

      let where = { performedOnId };
      if (notEmpty(search)) {
        const fields = ["performedOnId", "title", "status", "$user.name$"];
        const searchQuery = fields.map((col) => {
          return {
            [col]: {
              [db.Sequelize.Op.like]: "%" + search + "%",
            },
          };
        });
        where = { ...where, [db.Sequelize.Op.or]: searchQuery };
      }

      let activities = await ActivityLog.animals(req, where);
      // let activities = await AnimalActivityLog.listActivityLogs(
      //   req,
      //   null,
      //   where
      // );
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);

      return res.json(
        successRespSync({
          msg: activities == null ? respError.NOT_FOUND : success.FETCH,
          data: { activities },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;
