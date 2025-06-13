const express = require("express");
const router = express.Router();
const db = require(rootPath + "/models");
const auth = require(rootPath + "/middleware/auth");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { success } = require(rootPath + "/helpers/language");
const { logErrorOccurred, notEmpty } = require(rootPath + "/helpers/general");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
const { ActivityLog } = require(rootPath + "/helpers/controller");

/**
 * @description list all the activity logs
 */
router.get(
  "/",
  auth,
  validate.listValidation(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { search } = req.query;
      let where = null;

      if (notEmpty(search)) {
        const fields = [
          "title",
          "department",
          "role",
          "accessType",
          "module",
          "$user.name$",
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

      const activities = await ActivityLog.listAll(req, where);

      return res.json(
        successRespSync({
          msg: success.FETCHED,
          data: { activities },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);


router.get(
  "/:id",
  auth,
  validate.listValidation(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { id } = req.params;
      let where = { id };
      const ActivityLogDetailsbyId = await ActivityLog.getDetailsById(req,where);
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);
      return res.json(
        successRespSync({
          msg: ActivityLogDetailsbyId == null ? respError.NOT_FOUND : success.FETCH,
          data: { ActivityLogDetailsbyId },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;
