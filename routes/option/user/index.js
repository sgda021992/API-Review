const express = require("express");
const router = express.Router();
// loading models
const db = require(rootPath + "/models");
const auth = require(rootPath + "/middleware/auth");
const { serverError, successRespSync } = require(rootPath + "/helpers/api");
const { error, success } = require(rootPath + "/helpers/language"); // constant messages
const { logErrorOccurred, notEmpty } = require(rootPath + "/helpers/general"); // constant messages
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");

/**
 * @desc search user with name and send all matching result
 */
router.get(
  "/",
  auth,
  // validate.user_get(),
  validate.optionValidation(),
  validationErrorHandler,
  async (req, res) => {
    try {
      let where = {};
      let attributes = ["userNumber", "name", "email"];
      const { name: search } = req.query;

      // check if search query is not empty
      if (notEmpty(search)) {
        const fields = attributes;
        const searchQuery = fields.map((col) => {
          return {
            [col]: {
              [db.Sequelize.Op.like]: "%" + search + "%",
            },
          };
        });
        where = { ...where, [db.Sequelize.Op.or]: searchQuery };
      }

      // get list of the user
      const user = require(rootPath + "/helpers/controller");
      const { count: totalRows, rows: users } = await user.listUsers(
        req,
        attributes,
        where
      );

      // send response
      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: { users },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;
