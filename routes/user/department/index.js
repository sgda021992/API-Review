const express = require("express");
const router = express.Router();
const auth = require(rootPath + "/middleware/auth");
const db = require(rootPath + "/models");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { error, success } = require(rootPath + "/helpers/language");
const { logErrorOccurred, notEmpty } = require(rootPath + "/helpers/general");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
const { Department, ActivityLog } = require(rootPath + "/helpers/controller");

/**
 * @description create new department for user
 */
router.post(
  "/",
  auth,
  validate.department.post(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { name } = req.body;
      let set = { name };

      const transaction = await db.sequelize.transaction();

      try {
        const department = await Department.createDepartment(set, transaction);

        req.activity = {
          performedOnId: department.departmentNumber,
          type: "general",
          action: "DEPT_ADDED",
          meta: {},
        };
        await ActivityLog.create(req, transaction);

        await transaction.commit();

        return res.json(
          successRespSync({
            msg: success.CREATED,
            data: { department },
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

/**
 * @description update department details
 */
router.put(
  "/",
  auth,
  validate.department.put(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { departmentNumber, name, status } = req.body;

      let set = { name, status };
      let where = { departmentNumber };

      await Department.updateDepartment(set, where);

      req.activity = {
        performedOnId: departmentNumber,
        type: "general",
        action: "DEPT_UPDATE",
        meta: {},
      };
      await ActivityLog.create(req);

      const department = await Department.getDepartment(null, where);

      return res.json(
        successRespSync({
          msg: success.DEPARTMENT_UPDATED,
          data: { department },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @desc list all the departments
 */
router.get(
  "/",
  auth,
  validate.listValidation(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { search } = req.query;

      // attribute array
      const attributes = null;
      // condition
      let where = null;
      // check if search query is not empty
      if (notEmpty(search)) {
        let searchQuery = [];
        const fields = ["departmentNumber", "name"];

        fields.forEach((field) => {
          let query = {};
          query[field] = {
            [db.Sequelize.Op.like]: "%" + search + "%",
          };
          searchQuery.push(query);
        });

        where = { ...where, [db.Sequelize.Op.or]: searchQuery };
      }

      // fetch data
      let departments = await Department.listDepartments(
        req,
        attributes,
        where
      );
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);

      // send response
      return res.json(
        successRespSync({
          msg: departments == null ? respError.NOT_FOUND : success.FETCH,
          data: {
            departments,
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
