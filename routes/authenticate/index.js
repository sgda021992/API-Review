const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { User } = require(rootPath + "/models");
const {
  successResp,
  errorResp,
  errorRespSync,
  successRespSync,
} = require(rootPath + "/helpers/api");
const { error, success } = require(rootPath + "/helpers/language");
const { logErrorOccurred, notEmpty, randomNumber } = require(rootPath +
  "/helpers/general");
// loading middleware
const auth = require(rootPath + "/middleware/auth");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
// load helper controller

// load sub routes
router.use("/login", require("./login"));

//forget password
router.use("/forget-password", require("./forget-password"));

// user logout
router.post("/logout", auth, async (req, res) => {
  try {
    const { id } = req.user;
    const userExist = await User.findByPk(id);
    const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
    const { respError } = require(rootPath + "/helpers/response/" + language);

    if (userExist == null) throw respError.USER_NOT_EXIST; // if not exist throw error

    // set logout status
    let set = { isLogin: 0, sessionHash: await randomNumber() };
    console.log("logout status---------", set);
    await User.update(set, { where: { id } }); // mark user logout into DB

    // send response to client
    res.json(
      await successResp({
        msg: success.LOGOUT,
      })
    );
  } catch (err) {
    logErrorOccurred(__filename, err);
    return res.status(error.code.SERVER_ERROR).json(await errorResp());
  }
});

// Generate new accesstoken with help of refresh token
router.post("/access-token", async (req, res) => {
  try {
    let { accesstoken, refreshtoken } = req.body;

    // return res.json(req.body);

    // verify refresh token
    const { data } = await jwt.verify(
      refreshtoken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // return res.json(data);
    // check if accesstoken is the one who last login with that device
    if (data.token != accesstoken) throw new Error("Invalid Token");

    // generate access token if all goes well
    accesstoken = await jwt.sign(
      {
        data: { userNumber: data.userNumber, session: data.session },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    // generate refresh token if all goes well
    refreshtoken = await jwt.sign(
      {
        data: {
          userNumber: data.userNumber,
          session: data.session,
          token: accesstoken,
        },
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "365d" }
    );

    // send response
    res.json(
      successRespSync({
        msg: success.ACCESSTOKEN_GENERATED,
        data: {
          accesstoken,
          refreshtoken,
        },
      })
    );
  } catch (err) {
    logErrorOccurred(__filename, err);
    const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
    const { respError } = require(rootPath + "/helpers/response/" + language);
    return res.json(
      errorRespSync(req, {
        code: success.code.OK,
        msg: respError.INVALID_JWT_TOKEN,
      })
    );
  }
});

module.exports = router;
