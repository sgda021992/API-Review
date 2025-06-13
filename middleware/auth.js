const jwt = require("jsonwebtoken");
// load models
const { User, NAGRCRole, NAGRCDepartment } = require(rootPath + "/models");
// load helpers
const { error } = require(rootPath + "/helpers/language");
const { errorRespSync, unauthorizedAccess } = require(rootPath +
  "/helpers/api");
const { logErrorOccurred } = require(rootPath + "/helpers/general");

/**
 * @description Authorization middleware function
 */

module.exports = async function (req, res, next) {
  try {
    // Get token from header
    const token = req.header("oauth-token");
    if (!token) {
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);

      return res
        .status(error.code.UNAUTHORIZED)
        .json(
          errorRespSync(req, { code: error.code.UNAUTHORIZED, msg: respError.NO_TOKEN })
        );
    }

    // verify jwt signature
    try {
      var decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);
      logErrorOccurred(__filename, err);
      return unauthorizedAccess(req, res, respError.INVALID_JWT_TOKEN);
    }

    // check user exist in DB or not
    const { userNumber, session } = decoded.data;
    const userInfo = await User.findOne({
      include: [
        {
          model: NAGRCRole,
          as: "userRole",
          required: false,
        },
        {
          model: NAGRCDepartment,
          as: "userDept",
          required: false,
        },
      ],
      where: { userNumber },
      raw: true,
      nest: true,
    });

    // check some conditions
    switch (true) {
      case userInfo == undefined:
      case userInfo === null: {
        throw new Error("User not exist");
      }

      case userInfo.isLogin !== 1: {
        throw new Error("User not login");
      }

      case userInfo.sessionHash != session: {
        throw new Error("session is expired");
      }

      case userInfo.status !== 1: {
        throw new Error("account is deactivated");
      }
    }
    // attach to the request
    req.user = userInfo;
    next();
  } catch (err) {
    console.log(err);
    logErrorOccurred(__filename, err);
    return unauthorizedAccess(req, res);
  }
};
