const express = require("express");
const { Op } = require("sequelize");
const router = express.Router();
const db = require(rootPath + "/models");
const jwt = require("jsonwebtoken");
// loading models
const { User } = require(rootPath + "/models");
// loading helpers
const { forgetPassEmailValidation, TokenValidation, resetPassValidation } = require(rootPath + "/helpers/validation");
const { success } = require(rootPath + "/helpers/language");
const { successRespSync, errorRespSync, serverError } = require(rootPath +
  "/helpers/api");
const { logErrorOccurred } = require(rootPath +
  "/helpers/general");
// loading middleware
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
const { sendEmail } = require('../../../helpers/general');
const { createPassword } = require(rootPath + "/helpers/hash");
const { ActivityLog } = require(rootPath + "/helpers/controller");

/**
 * @description get user details
 * @onError Show Errors
 * @onSuccess Send user information
 */
 router.get(
  "/get-user-details/:email",
  async (req, res) => {
    try {
      let userData = await getUserInfo(req, res, true);
      if (userData.user !== null || userData.user !== undefined || userData.verified === 1 || userData.status === 1) {
        const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
        const { respError } = require(rootPath + "/helpers/response/" + language);

        res.json(
          successRespSync({
            msg: respError.USER_DETAILS_FETCHED,
            data: {
              email: userData.email,
              mobile: userData.mobile
            }
          })
        );
      }
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description User login and authentication
 * @onError Show Errors
 * @onSuccess Send token to email for forget password
 */
router.post(
  "/email",
  forgetPassEmailValidation(),
  validationErrorHandler,
  async (req, res) => {
    try {
      let userData = await getUserInfo(req, res, false);
      if (userData.user !== null || userData.user !== undefined || userData.verified === 1 || userData.status === 1) {
        const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
        const { respError } = require(rootPath + "/helpers/response/" + language);
        const accesstoken = await getAccessToken(userData);
        const getResponse = await sendEmail({ html: process.env.UI_URL + '?token=' + accesstoken, to: req.body.email, subject: 'Reset Password - Nagrac' })
        // send response to the client
  
        res.json(
          successRespSync({
            msg: respError.EMAIL_SENT_SUCCESS
          })
        );
      }
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description Verify token is valid or not
 * @onError Show Errors
 * @onSuccess Send information if user is valid or not
 */
router.post(
  "/validate",
  TokenValidation(),
  validationErrorHandler,
  async (req, res) => {
    try {
      var decoded = await jwt.verify(req.body.token, process.env.ACCESS_TOKEN_SECRET);
      if (decoded.data) {
        res.json(
          successRespSync({
            msg: success.VALID_TOKEN,
            data: {
              status: true
            }
          })
        );
      } else {
        res.json(
          successRespSync({
            msg: success.INVALID_JWT_TOKEN,
            data: {
              status: false
            }
          })
        );
      }
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);


/**
 * @description reset password for the user
 * @onError Show Errors
 * @onSuccess Send new token
 */
router.put(
  "/reset-password",
  resetPassValidation(),
  validationErrorHandler,
  async (req, res) => {
    try {

      var decoded = await jwt.verify(req.body.token, process.env.ACCESS_TOKEN_SECRET);
      if (decoded.data) {
        const { password } = req.body;
        const set = { password: await createPassword(password) };

        const transaction = await db.sequelize.transaction();
        try {
          await db.User.update(set, { where: { userNumber: decoded?.data?.userNumber }, transaction });

          req.activity = {
            performedOnId: decoded.data.userNumber,
            type: "user",
            action: "PASSWORD_RESET",
            meta: {},
          };

          req.user=decoded?.data;

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
      } else {
        res.json(
          successRespSync({
            msg: success.INVALID_JWT_TOKEN
          })
        );
      }
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);



/**
 * @description generate accesstoken
 * @param {*} userData
 */
async function getAccessToken(userData) {
  let accesstoken = await jwt.sign(
    {
      data: {
        userNumber: userData.userNumber,
        session: userData.sessionHash,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
  return accesstoken;
}


/**
 * @description fetch user information with email or mobile
 * @param {*} credential
 */
async function getUserInfo(req, res, flag) {
  const { email, mobile } = flag ? req.params : req.body ;

  const query = {
    attributes: [
      "id",
      "userNumber",
      "userName",
      "name",
      "email",
      "mobile",
      "password",
      "role",
      "department",
      "verified",
      "sessionHash",
      "isLogin",
      "status",
    ],
    where: {},
    raw: true,
    nest: true,
  };
  if (mobile) {
    query.where['mobile'] = mobile;
  } if (email) {
    query.where['email'] = email;
  }
  const user = await User.findOne(query);
  const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
  const { respError } = require(rootPath + "/helpers/response/" + language);
  switch (true) {
    case user == null:
    case user == undefined: {

      return res.json(
        errorRespSync(req, {
          code: success.code.OK,
          msg: respError.USER_NOT_EXIST,
        })
      );
    }

    case user.verified !== 1: {
      return res.json(
        errorRespSync(req, {
          code: success.code.OK,
          msg: respError.USER_NOT_VERIFIED,
        })
      );
    }

    case user.status !== 1: {
      return res.json(
        errorRespSync(req, {
          code: success.code.OK,
          msg: respError.DEACTIVATED_USER,
        })
      );
    }
  }

  return user;
}


module.exports = router;
