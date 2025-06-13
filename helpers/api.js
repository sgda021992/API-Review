const { error } = require("./language");

/**
 * Send a success response (async version)
 * @param {Object} args - Contains message and data to send
 * @returns {Object} - Standardized success response
 */
exports.successResp = async (args) => {
  let { msg, data } = args;

  // If `data` contains a nested `data` key, rename it to `info` and remove original
  if (data != null && data != undefined && data.hasOwnProperty("data")) {
    data = { ...data, info: data.data };
    delete data.data;
  }

  return {
    success: true,
    code: 200,
    message: msg,
    data: data == null || data == undefined ? {} : data,
  };
};

/**
 * Send an error response (async version)
 * @param {Object} args - Contains optional message and code
 * @returns {Object} - Standardized error response
 */
exports.errorResp = async (args = {}) => {
  const { msg, code } = args;
  return {
    success: false,
    code: code == undefined ? 500 : code,
    message: msg == undefined ? error.SERVER : msg,
  };
};

/**
 * Send a success response (sync version)
 * @param {Object} args - Contains message and data
 * @returns {Object} - Standardized success response
 */
exports.successRespSync = (args) => {
  let { msg, data } = args;

  // Handle nested data formatting
  if (data != null && data != undefined && data.hasOwnProperty("data")) {
    data = { ...data, info: data.data };
    delete data.data;
  }

  return {
    success: true,
    code: 200,
    message: msg,
    data: data == null || data == undefined ? {} : data,
  };
};

/**
 * Send an error response (sync version) with localization support
 * @param {Object} req - Express request object for header access
 * @param {Object} args - Contains optional message and code
 * @returns {Object} - Localized error response
 */
exports.errorRespSync = (req, args = {}) => {
  const { msg, code } = args;
  const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en';

  // Load localized response messages
  const { respError } = require(rootPath + "/helpers/response/" + language);

  return {
    success: false,
    code: code == undefined ? 500 : code,
    message: msg == undefined ? respError.SERVER : msg,
  };
};

/**
 * Send a validation error response with localization
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Object} args - Optional error details
 * @returns {Object} - Sends response directly with validation failure message
 */
exports.validationErrorRespSync = (req, res, args = {}) => {
  const { msg } = args;
  const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en';

  // Load localized error messages
  const { respError } = require(rootPath + "/helpers/response/" + language);

  return res.status(error.code.UNPROCESSABLE_ENTITY).json({
    success: false,
    code: error.code.UNPROCESSABLE_ENTITY,
    message: msg ?? respError.VALIDATION_FAILED,
  });
};

/**
 * Send a generic server error response
 * @param {Object} res - Express response
 * @returns {Object} - Sends server error response
 */
exports.serverError = (res) => {
  return res.status(error.code.SERVER_ERROR).json({
    success: false,
    code: error.code.SERVER_ERROR,
    message: error.SERVER,
  });
};

/**
 * Send an unauthorized access response
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {String|null} msg - Optional custom message
 * @returns {Object} - Sends unauthorized response
 */
exports.unauthorizedAccess = (req, res, msg = null) => {
  const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en';
  const { respError } = require(rootPath + "/helpers/response/" + language);

  return res.status(error.code.UNAUTHORIZED).json({
    success: false,
    code: error.code.UNAUTHORIZED,
    msg: msg ?? respError.UNAUTHORIZED,
  });
};

/**
 * Send a forbidden access response
 * @param {Object} res - Express response
 * @returns {Object} - Sends forbidden access response
 */
exports.accessForbidden = (res) => {
  const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en';
  const { respError } = require(rootPath + "/helpers/response/" + language);

  return res.status(error.code.FORBIDDED).json({
    success: false,
    code: error.code.FORBIDDED,
    msg: respError.INSUFFICIENT_PERMISSIONS,
  });
};

/**
 * Send a bad request response
 * @param {Object} res - Express response
 * @returns {Object} - Sends bad request response
 */
exports.badRequest = (res) => {
  const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en';
  const { respError } = require(rootPath + "/helpers/response/" + language);

  return res.status(error.code.BAD_REQUEST).json({
    success: false,
    code: error.code.BAD_REQUEST,
    msg: respError.BAD_REQUEST,
  });
};
