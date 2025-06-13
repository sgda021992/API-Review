const express = require("express");
const router = express.Router();
const db = require(rootPath + "/models");
const auth = require(rootPath + "/middleware/auth");
const hasPermission = require(rootPath + "/middleware/permission");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { error, success } = require(rootPath + "/helpers/language");
const { logErrorOccurred, notEmpty, getFormattedId } = require(rootPath +
  "/helpers/general");
const { createPassword } = require(rootPath + "/helpers/hash");
const { ActivityLog } = require(rootPath + "/helpers/controller");

// load subroutes here
router.use("/password", require("./password"));
router.use("/import", require("./import"));
router.use("/permissions", require("./permissions"));
router.use("/profile", require("./profile"));
router.use("/role", require("./role"));
router.use("/department", require("./department"));

/**
 * @desc user registration| user signup
 */
router.post(
  "/",
  validate.userRegistration(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { name, middleName, lastName, email, mobile, password, department, role } = req.body;

      const userData = {
        name,
        middleName,
        lastName,
        email,
        mobile,
        password: await createPassword(password),
        department,
        role,
        verified: 1,
      };

      const transaction = await db.sequelize.transaction();

      try {        
        let result = await db.User.create(userData, { transaction });
        result = await result.toJSON();
        console.log(result);
        return;
        // create custom id
        const userNumber = getFormattedId("USR", result.id);
        await db.User.update(
          { userNumber },
          { where: { id: result.id }, transaction }
        );

        delete result.password;
        delete result.id;
        result.userNumber = userNumber;
        req.user = result;
        req.activity = {
          performedOnId: userNumber,
          type: "user",
          action: "USER_REG",
          meta: {},
        };
        await ActivityLog.create(req, transaction);

        await transaction.commit();

        return res.json(
          successRespSync({
            msg: success.USER_REGISTERED,
            data: result,
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
 * @desc update user informations
 */
router.put(
  "/",
  auth,
  validate.user_put(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const {
        userNumber,
        name,
        middleName,
        lastName,
        email,
        mobile,
        password,
        department,
        role,
        status,
        verified,
      } = req.body;

      const set = {
        name,
        middleName,
        lastName,
        email,
        mobile,
        password: notEmpty(password)
          ? await createPassword(password)
          : undefined,
        department,
        role,
        verified,
        status,
      };

      Object.keys(set).forEach((key) => {
        set[key] == undefined || set[key] == null ? delete set[key] : {};
      });

      // update user details in DB
      const [updated] = await db.User.update(set, { where: { userNumber } });

      req.activity = {
        performedOnId: userNumber,
        type: "user",
        action: "USER_DETAILS_UPDATE",
        meta: {},
      };
      await ActivityLog.create(req);
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);

      return res.json(
        successRespSync({
          msg: updated ? success.USER_DETAIL_UPDATED : respError.NOT_FOUND,
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @desc fetch registered user list
 */
router.get(
  "/",
  auth,
  // hasPermission,
  validate.user_get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      let where = {};
      let attributes = null;
      const { status, search, imported } = req.query;

      // check if status is not empty
      if (notEmpty(status)) {
        where.status = status;
      }
      if (notEmpty(imported)) {
        where = { ...where, imported };
      }
      // check if search query is not empty
      if (notEmpty(search)) {
        let searchQuery = [];
        const fields = ["name","middleName" ,"lastName","email", "role", "department"];
        fields.forEach((field) => {
          let query = {};
          query[field] = {
            [db.Sequelize.Op.like]: "%" + search + "%",
          };
          searchQuery.push(query);
        });
        where = { ...where, [db.Sequelize.Op.or]: searchQuery };
      }

      const user = require(rootPath + "/helpers/controller");
      const { count: totalRows, rows } = await user.listUsers(
        req,
        attributes,
        where
      );
      // get counts of active/inactive and imported users
      const activeinactive = await user.countActInactUser();
      const importedUsers = await user.countImportedUser();
      const totalUsers = await user.countTotalUsers();

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: {
            numRows: rows.length,
            totalRows,
            importedUsers,
            ...activeinactive,
            totalUsers,
            rows,
          },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @desc fetch registered user list
 */
router.get(
  "/:userNumber",
  auth,
  validate.individualuser_get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { userNumber } = req.params;

      const userData = await db.User.findOne({
        include: [
          {
            model: db.NAGRCDepartment,
            as: "userDept",
            attributes: [],
          },
          {
            model: db.NAGRCRole,
            as: "userRole",
            attributes: [],
          },
        ],
        attributes: [
          "userNumber",
          "name",
          "middleName",
          "lastName",
          "email",
          "mobile",
          "department",
          "role",
          "verified",
          [db.Sequelize.literal("userRole.name"), "rolename"],
          [db.Sequelize.literal("userDept.name"), "deptname"],
        ],
        where: { userNumber },
      });
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);

      return res.json(
        successRespSync({
          msg: userData == null ? respError.NOT_FOUND : success.FETCH,
          data: userData,
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;
