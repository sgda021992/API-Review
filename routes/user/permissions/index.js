const express = require("express");
const router = express.Router();
const auth = require(rootPath + "/middleware/auth");
const hasPermissions = require(rootPath + "/middleware/permission");
const db = require(rootPath + "/models");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { error, success } = require(rootPath + "/helpers/language");
const { logErrorOccurred } = require(rootPath + "/helpers/general");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
const { Permission, ActivityLog } = require(rootPath + "/helpers/controller");

/**
 * @desc update all the permissions of roles and department
 */
router.put(
  "/",
  auth,
  validate.permission.put(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { roleId: nagrcRoleId, departmentId: nagrcDepartmentId } = req.body;

      const transaction = await db.sequelize.transaction();

      try {
        await Permission.bulkUpdatePermissions(req, transaction);

        req.activity = {
          performedOnId: nagrcDepartmentId,
          type: "general",
          action: "PERMISSION_UPDATE",
          meta: { permission: { nagrcRoleId, nagrcDepartmentId } },
        };
        await ActivityLog.create(req, transaction);

        await transaction.commit();

        let where = { nagrcDepartmentId, nagrcRoleId };
        const permissions = await Permission.listPermissions(req, where);

        return res.json(
          successRespSync({
            msg: success.PERMISSION_UPDATED,
            data: { permissions },
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
 * @desc list all the permissions of roles and department
 */
router.get(
  "/",
  auth,
  // hasPermissions,
  validate.permission.getAll(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { role: nagrcRoleId = null, department: nagrcDepartmentId = null } =
        req.query;

      let where = { nagrcDepartmentId, nagrcRoleId };
      const permissions = await Permission.listPermissions(req, where);
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);

      return res.json(
        successRespSync({
          msg: permissions == null ? respError.NOT_FOUND : success.FETCH,
          data: {
            permissions,
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
