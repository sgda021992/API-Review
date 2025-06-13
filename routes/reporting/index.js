const express = require("express");
const router = express.Router();

router.use("/production-report", require("../analytics/production-report"));
router.use("/semen-embryo-report", require("../analytics/semen-embryo-report"));
router.use("/breeder-report", require("../analytics/breeder-report"));
router.use("/data-scientist", require("../analytics/data-scientist"));


module.exports = router;
