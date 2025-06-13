const express = require("express");
const path = require("path");
const router = express.Router();
const db = require(rootPath + "/models");
const auth = require(rootPath + "/middleware/auth");
const { uploadSingleBuffer } = require(rootPath + "/middleware/upload");
const xlsx = require(rootPath + "/middleware/xlsx");
const { IMPORT_USER_PATH } = require(rootPath + "/helpers/constant");
const { saveBufferToFile } = require(rootPath + "/helpers/upload");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { success } = require(rootPath + "/helpers/language");
const { logErrorOccurred, notEmpty } = require(rootPath + "/helpers/general");
const validate = require(rootPath + "/helpers/validation");
const { importErrorHandler } = require(rootPath +
  "/middleware/customErrorHandler");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
const { UserImportHistory, ActivityLog } = require(rootPath +
  "/helpers/controller");

// serve imported file
router.use(
  "/file",
  express.static(path.join(rootPath, "/upload/import-user/"))
);

/**
 * @desc uploading importing file in system for later importing
 */
const param = {
  whiteListMimeTypes: [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  maxFileSize: 5,
  fieldName: "user",
};

router.post(
  "/",
  auth,
  uploadSingleBuffer(param),
  xlsx,
  validate.importUsers(),
  importErrorHandler,
  async (req, res) => {
    try {
      const { userNumber } = req.user;
      const {
        filename: fileName,
        extension: fileExt,
        originalname: originalName,
      } = await saveBufferToFile(req, IMPORT_USER_PATH);

      const set = {
        userNumber,
        fileExt,
        fileName,
        originalName,
      };

      const transaction = await db.sequelize.transaction();

      try {
        const userImportHistory = await UserImportHistory.register(
          set,
          transaction
        );

        req.activity = {
          performedOnId: userImportHistory.UIHNumber,
          type: "user",
          action: "USER_IMPORT",
          meta: {},
        };
        await ActivityLog.create(req, transaction);

        await transaction.commit();

        return res.json(
          successRespSync({
            msg: success.IMPORT_FILE_UPLOADED,
            data: { userImportHistory },
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

router.delete(
  "/:UIHNumber",
  auth,
  validate.userimport.delete(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { UIHNumber } = req.params;

      await db.UserImportHistory.update(
        { isDeleted: 1 },
        { where: { UIHNumber } }
      );

      req.activity = {
        performedOnId: UIHNumber,
        type: "user",
        action: "IMPORT_FILE_DELETED",
        meta: {},
      };
      await ActivityLog.create(req);

      return res.json(
        successRespSync({
          msg: success.DELETED,
          data: { UIHNumber },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @desc list all the user improt history
 */
router.get(
  "/",
  auth,
  validate.listValidation(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { search } = req.query;
      let where = { isDeleted: 0 };

      // check if search query is not empty
      if (notEmpty(search)) {
        const fields = ["UIHNumber", "fileExt", "status", "originalName"];
        const searchQuery = fields.map((col) => {
          return {
            [col]: {
              [db.Sequelize.Op.like]: "%" + search + "%",
            },
          };
        });
        // update where condition
        where = { ...where, [db.Sequelize.Op.or]: searchQuery };
      }

      const userImportHistory = await UserImportHistory.listAll(req, where);

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: {
            userImportHistory,
          },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

router.get(
  "/:UIHNumber",
  auth,
  validate.userimport.get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { UIHNumber } = req.params;

      const attributes = null;
      const where = { UIHNumber, isDeleted: 0 };
      let userImportHistory = await UserImportHistory.getDetails(
        attributes,
        where
      );

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: { userImportHistory },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;
