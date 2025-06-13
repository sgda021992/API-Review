const express = require("express");
const router = express.Router();
// validation modules
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
// helpers module
const {
  successRespSync,
  validationErrorRespSync,
  serverError,
} = require(rootPath + "/helpers/api");
const { error } = require(rootPath + "/helpers/language"); // constant messages
const { logErrorOccurred } = require(rootPath + "/helpers/general"); // constant messages

/**
 * @desc email validation for client side
 */
router.post(
  "/email",
  validate.email(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { email } = req.body;
      // check if user already exist
      const user = require(rootPath + "/helpers/controller");
      const isAlreadyExist = await user.isAlreadyExist(email);
      // check if email exist or not
      if (isAlreadyExist == null) {
        // email is unique
        return res.json(successRespSync({}));
      } else {
        // email is not unique
        const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
        const { respError } = require(rootPath + "/helpers/response/" + language);
        return validationErrorRespSync(req, res, {
          msg: respError.EMAIL_EXIST_ALREADY,
        });
      }
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;