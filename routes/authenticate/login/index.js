const express = require("express");
const { Op } = require("sequelize");
const router = express.Router();
const jwt = require("jsonwebtoken");
// loading models
const { User } = require(rootPath + "/models");
// loading helpers
const { loginValidation } = require(rootPath + "/helpers/validation");
const { verifyHash } = require(rootPath + "/helpers/hash");
const { error, success } = require(rootPath + "/helpers/language");
const { getRoleAndDepartment } = require(rootPath + "/helpers/module");
const { successRespSync, errorRespSync, serverError } = require(rootPath +
  "/helpers/api");
const { logErrorOccurred, notEmpty, randomNumber } = require(rootPath +
  "/helpers/general");
// loading middleware
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
// load helper controller
const controller = require(rootPath + "/helpers/controller");

/**
 * @description User login and authentication
 * @onError Show Errors
 * @onSuccess Send user information with access and refresh token
 */
router.post(
  "/",
  loginValidation(),
  validationErrorHandler,
  async (req, res) => {
    try {
      let userData = await getUserInfo(req, res);
      userData = await verifyPassword(req, res, userData);

      const { name, userName, email, mobile } = userData;
      // generate access and refresh token
      const accesstoken = await getAccessToken(userData);
      const refreshtoken = await getRefreshToken(userData, accesstoken);
      // get user modules list with permissions
      const modules = await getUserModules(req, userData);

      // send response to the client
      res.json(
        successRespSync({
          msg: success.LOGIN,
          data: {
            name,
            userName,
            email,
            mobile,
            token: accesstoken,
            refreshtoken,
            modules,
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
 * @description generate refresh token
 * @param {*} userData
 */
async function getRefreshToken(userData, accesstoken) {
  let refreshtoken = await jwt.sign(
    {
      data: {
        userNumber: userData.userNumber,
        token: accesstoken,
        session: userData.sessionHash,
      },
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "365d" }
  );
  return refreshtoken;
}

/**
 * @description Verify input password of the user
 * @param {*} req
 * @param {*} res
 * @param {*} user
 */
async function verifyPassword(req, res, userData) {
  const { password } = req.body;

  // verify password
  let isEqual = await verifyHash(password, userData.password);

  // check if password is correct or not
  if (!isEqual) {
    const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
    const { respError } = require(rootPath + "/helpers/response/" + language);

    return res.json(
      errorRespSync(req, {
        code: success.code.OK,
        msg: respError.INVALID_CREDENTIAL,
      })
    );
  }

  // set login status of user
  let set = { isLogin: 1 };
  // if session hash is not generated then create one and update it into DB
  if (!notEmpty(userData.sessionHash)) {
    const sessionHash = await randomNumber();
    set = { ...set, sessionHash };
    userData = { ...userData, sessionHash };
  }

  // mark user login into DB
  await User.update(set, {
    where: { id: userData.id },
  });

  return userData;
}

/**
 * @description fetch user information with email or mobile
 * @param {*} credential
 */
async function getUserInfo(req, res) {
  const { credential } = req.body;

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
    where: {
      [Op.or]: [{ email: credential }, { mobile: credential }],
    },
    raw: true,
    nest: true,
  };
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

/**
 * @description Get user modules and permissions
 * @param {*} user
 */
async function getUserModules(req, user) {
  const { role: nagrcRoleId = null, department: nagrcDepartmentId = null } =
    user;
  const where = { nagrcDepartmentId, nagrcRoleId };
  const { rows } = await controller.Permission.listPermissions(req, where);
  // const modules = await controller.Module.listModules({
  //   nagrcDepartmentId,
  //   nagrcRoleId,
  // });
  return rows;
}

module.exports = router;
