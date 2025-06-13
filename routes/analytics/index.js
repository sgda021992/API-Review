const express = require("express");
const router = express.Router();

router.use("/production-analytics", require("./production-analytics"));
router.use("/animal-analytics", require("./production-analytics"));
router.use("/semen-embryo", require('./semen-embryo-report'));
router.use("/pregnency-check-analytics", require("./pregnency-check-analytics"));

module.exports = router;
