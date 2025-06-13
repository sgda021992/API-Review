const express = require("express");
const router = express.Router();
const auth = require(rootPath + "/middleware/auth");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { success } = require(rootPath + "/helpers/language");
const { logErrorOccurred } = require(rootPath + "/helpers/general");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
const { TaskEvent } = require(rootPath + "/helpers/controller");

/**
 * @desc fetch performance details of registered single animal
 */
router.get(
  "/:animalNumber",
  auth,
  validate.animaltaskreminder.get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { animalNumber } = req.params;
      const where = { animalNumber };

      const reminder = await TaskEvent.listAnimalTask(req, where);

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: { reminder },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;
