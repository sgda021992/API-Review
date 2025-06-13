const express = require("express");
const moment = require("moment");
const router = express.Router();
// loading models
const db = require(rootPath + "/models");
// loading middleware
const auth = require(rootPath + "/middleware/auth");
// loading helpers
const {
  successResp,
  errorResp,
  successRespSync,
  serverError,
} = require(rootPath + "/helpers/api");
const { error, success } = require(rootPath + "/helpers/language"); // constant messages
const { logErrorOccurred, notEmpty, getFormattedId } = require(rootPath +
  "/helpers/general"); // constant messages
const {
  WHITELIST_MIMETYPE,
  ANIMAL_IMAGE_UPLOAD_PATH,
  ANIMAL_IMAGE_URL,
} = require(rootPath + "/helpers/constant"); // declared constants

// validations
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");

// file upload normally without AWS
const { uploadSingle } = require(rootPath + "/middleware/upload.js");
const unlinkFileOnErr = require(rootPath + "/middleware/unlinkFileOnErr");
// load helper controller
const controller = require(rootPath + "/helpers/controller");

/**
 * @description animal image update
 */

// params for file uploading
let params;
params = {
  uploadpath: ANIMAL_IMAGE_UPLOAD_PATH,
  whiteListMimeTypes: WHITELIST_MIMETYPE.images,
  maxFileSize: 5,
  fieldName: "image",
};

router.put(
  "/",
  auth,
  uploadSingle(params),
  validate.animalimage.put(),
  unlinkFileOnErr,
  validationErrorHandler,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { animalNumber, id } = req.body;
      const { filename, originalname } = req.file;

      const extension = filename.split(".").pop();

      const set = {
        userId,
        animalNumber,
        originalName: originalname,
        imageName: filename,
        imageType: extension,
      };

      const transaction = await db.sequelize.transaction();

      try {
        await db.AnimalImage.destroy({
          where: { animalNumber },
          transaction,
        });

        await db.AnimalImage.create(set, {
          transaction,
        });

        // add animal activity log
        await controller.AnimalActivityLog.addActivityLog(req, {
          action: "ANIMAL_IMG_UPDATE",
          animalNumber,
        });

        req.activity = {
          performedOnId: animalNumber,
          type: "animal",
          action: "ANIMAL_IMG_UPDATE",
          meta: {},
        };
        await controller.ActivityLog.create(req, transaction);

        await transaction.commit();

        return res.json(
          successRespSync({
            msg: success.ANIMAL_IMG_UPDATED,
            data: {
              image: {
                imgURL: ANIMAL_IMAGE_URL + filename,
              },
            },
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
