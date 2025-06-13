const express = require("express");
const router = express.Router();
const db = require(rootPath + "/models");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { success } = require(rootPath + "/helpers/language");
const { logErrorOccurred, notEmpty } = require(rootPath + "/helpers/general");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
const controller = require(rootPath + "/helpers/controller");

/**
 * @description list all the farms as options
 */
router.get(
  "/list",
  validate.optionValidation(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { search } = req.query;
      const attributes = ["name", "farmNumber"];
      let where = null;

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

      const { count, rows } = await controller.Farm.listAllFarms(
        req,
        attributes,
        where,
        false
      );

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: {
            farms: rows,
          },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;
