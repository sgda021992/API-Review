const express = require("express");
const router = express.Router();
const auth = require(rootPath + "/middleware/auth");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
// controller
const { TaskEvent } = require(rootPath + "/helpers/controller");

/**
 * @description fetch all the events
 */
router.get(
  "/",
  auth,
  validate.task.event.get(),
  validationErrorHandler,
  TaskEvent.getEvents
);

module.exports = router;
