const express = require("express");
const router = express.Router();

router.use("/task", require("./task"));
router.use("/event", require("./event"));

module.exports = router;
