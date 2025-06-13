const { validationResult } = require("express-validator");
const { validationErrorRespSync } = require(rootPath + "/helpers/api");
const { error } = require(rootPath + "/helpers/language");

module.exports = async function (req, res, next) {
  try {
    // Extract validation errors, if any, from the request
    const errors = validationResult(req);

    // If validation errors exist, handle and respond with localized error messages
    if (!errors.isEmpty()) {
      // Translate error messages based on requested language in headers
      const errorsInProperLanguage = handleLanguages(req.headers, errors.mapped());

      // Send a formatted validation error response
      return validationErrorRespSync(req, res, {
        msg: { errors: errorsInProperLanguage },
      });
    }

    // No validation errors, proceed to the next middleware or route handler
    next();
  } catch (err) {
    // Log unexpected error and return a generic server error response
    console.error("auth middleware catch err *********", err.message);
    res.status(error.code.SERVER).json(await errorResp());
  }
};

/**
 * Translates validation error messages to the preferred language.
 *
 * @param {Object} headers - Request headers, expected to include a 'language' key.
 * @param {Object} errorsMapped - Errors mapped by field, each containing a localized msg object.
 * @returns {Object} errorsMapped with translated error messages.
 */
function handleLanguages(headers, errorsMapped) {
  const language = headers['language']; // Get language preference from headers

  // Replace the message with the appropriate translation (default to English)
  for (let errorKey in errorsMapped) {
    errorsMapped[errorKey].msg = errorsMapped[errorKey].msg[language ? language : 'en'];
  }

  return errorsMapped;
}
