const express = require("express");
const router = express.Router();

router.use("/farm", require("./farm"));
router.use("/country", require("./country"));
router.use("/animal", require("./animal"));
router.use("/state", require("./state"));
router.use("/city", require("./city"));
router.use("/village", require("./village"));
router.use("/user", require("./user"));
router.use("/", require("./option"));
module.exports = router;
