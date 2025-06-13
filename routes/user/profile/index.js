const express = require("express");
const router = express.Router();
const db = require(rootPath + "/models");
const auth = require(rootPath + "/middleware/auth");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { success } = require(rootPath + "/helpers/language");
const { logErrorOccurred, removeEmptyValuesFromObject } = require(rootPath +
  "/helpers/general");
const controller = require(rootPath + "/helpers/controller");
const {
  WHITELIST_MIMETYPE,
  PROFILE_IMAGE_UPLOAD_PATH,
  PROFILE_IMAGE_URL,
} = require(rootPath + "/helpers/constant");
const { uploadSingle } = require(rootPath + "/middleware/upload.js");
const unlinkFileOnErr = require(rootPath + "/middleware/unlinkFileOnErr");

// serving profile image
router.use("/img", express.static(PROFILE_IMAGE_UPLOAD_PATH));

/**
 * @description profile image update
 */
let params = {
  uploadpath: PROFILE_IMAGE_UPLOAD_PATH,
  whiteListMimeTypes: WHITELIST_MIMETYPE.images,
  maxFileSize: 5,
  fieldName: "profile",
};

router.put(
  "/img",
  auth,
  uploadSingle(params),
  unlinkFileOnErr,
  async (req, res) => {
    try {
      const { userNumber } = req.user;
      const { filename, originalname } = req.file;

      const set = {
        profilePicOriginalName: originalname,
        profilePicName: filename,
      };

      const transaction = await db.sequelize.transaction();

      try {
        await db.User.update(set, { where: { userNumber }, transaction });

        req.activity = {
          performedOnId: userNumber,
          type: "user",
          action: "PROFILE_PIC_UPDATED",
          meta: {},
        };
        await controller.ActivityLog.create(req, transaction);

        await transaction.commit();

        return res.json(
          successRespSync({
            msg: success.PROFILE_PIC_UPDATED,
            data: {
              image: { imgURL: PROFILE_IMAGE_URL + filename },
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

/**
 * @description get profile details of the user
 */
router.get("/", auth, async (req, res) => {
  try {
    const profile = await controller.getUserProfile(req);

    return res.json(
      successRespSync({
        msg: success.PROFILE_FETCHED,
        data: profile,
      })
    );
  } catch (err) {
    logErrorOccurred(__filename, err);
    return serverError(res);
  }
});

/**
 * @desc update user informations
 */
router.put(
  "/",
  auth,
  // validate.user_put(),
  // validationErrorHandler,
  async (req, res) => {
    try {
      const { name, email, mobile } = req.body;
      const { userNumber } = req.user;

      const set = {
        name,
        email,
        mobile,
      };
      removeEmptyValuesFromObject(set);

      const transaction = await db.sequelize.transaction();

      try {
        await db.User.update(set, { where: { userNumber }, transaction });

        req.activity = {
          performedOnId: userNumber,
          type: "user",
          action: "PROFILE_UPDATED",
          meta: {},
        };
        await controller.ActivityLog.create(req, transaction);

        await transaction.commit();

        const profile = await controller.getUserProfile(req);

        return res.json(
          successRespSync({
            msg: success.PROFILE_FETCHED,
            data: profile,
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
