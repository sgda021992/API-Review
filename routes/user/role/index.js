const express = require("express");
const router = express.Router();
const auth = require(rootPath + "/middleware/auth");
const hasPermission = require(rootPath + "/middleware/permission");
const db = require(rootPath + "/models");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { error, success } = require(rootPath + "/helpers/language");
const { logErrorOccurred, notEmpty } = require(rootPath + "/helpers/general");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
const { Role, ActivityLog } = require(rootPath + "/helpers/controller");

/**
 * @description create new role for user
 */
router.post(
  "/",
  auth,
  validate.role.post(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { name, departmentNumber } = req.body;

      const transaction = await db.sequelize.transaction();

      try {
        let set = { departmentNumber, name };
        const role = await Role.createRole(set, transaction);

        req.activity = {
          performedOnId: role.roleNumber,
          type: "general",
          action: "ROLE_ADDED",
          meta: {},
        };
        await ActivityLog.create(req, transaction);

        await transaction.commit();

        return res.json(
          successRespSync({
            msg: success.CREATED,
            data: { role },
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
 * @description update role details
 */
router.put(
  "/",
  auth,
  validate.role.put,
  validationErrorHandler,
  async (req, res) => {
    try {
      const { roleNumber, name, status, departmentNumber } = req.body;

      let set = { name, status, departmentNumber };
      let where = { roleNumber };

      await Role.updateRole(set, where);

      req.activity = {
        performedOnId: roleNumber,
        type: "general",
        action: "ROLE_UPDATE",
        meta: {},
      };
      await ActivityLog.create(req);

      const role = await Role.getRole(null, where);

      return res.json(
        successRespSync({
          msg: success.ROLE_UPDATED,
          data: { role },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @desc list all the roles
 */
router.get(
  "/",
  auth,
  // hasPermission,
  validate.listValidation(),
  validate.role.getAll(),
  validationErrorHandler,
  async (req, res) => {
    try {
      // return res.json("listing all the roles");
      const { id: userId } = req.user;
      const { search, department: departmentNumber } = req.query;

      // attribute array
      const attributes = null;
      // condition
      let where = null;

      // show by department if department not empty
      if (notEmpty(departmentNumber)) {
        where = { ...where, departmentNumber };
      }
      // check if search query is not empty
      if (notEmpty(search)) {
        let searchQuery = [];
        const fields = ["roleNumber", "departmentNumber", "name"];

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
      let roles = await Role.listRoles(req, attributes, where);
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);
      // send response
      return res.json(
        successRespSync({
          msg: roles == null ? respError.NOT_FOUND : success.FETCH,
          data: {
            roles,
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
