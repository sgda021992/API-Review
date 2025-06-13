const express = require("express");
const router = express.Router();
const db = require(rootPath + "/models");
const auth = require(rootPath + "/middleware/auth");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { success } = require(rootPath + "/helpers/language");
const { logErrorOccurred } = require(rootPath + "/helpers/general");
const { createPassword } = require(rootPath + "/helpers/hash");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
const { ActivityLog } = require(rootPath + "/helpers/controller");

/**
 * @desc update user informations
 */
router.put(
  "/",
  auth,
  validate.password.put(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { newPassword } = req.body;
      const { userNumber } = req.user;

      const set = { password: await createPassword(newPassword) };

      const transaction = await db.sequelize.transaction();
      try {
        await db.User.update(set, { where: { userNumber }, transaction });

        req.activity = {
          performedOnId: userNumber,
          type: "user",
          action: "PASSWORD_CHANGED",
          meta: {},
        };
        await ActivityLog.create(req, transaction);

        await transaction.commit();

        return res.json(
          successRespSync({
            msg: success.PASSWORD_CHANGED,
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
