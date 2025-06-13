const express = require("express");
const requestIp = require("request-ip");
const router = express.Router();

router.use(requestIp.mw());

// using routes
router.use("/analytics", require("./analytics"));
router.use("/reporting", require("./reporting"));
router.use("/activity-log", require("./activity-log"));
router.use("/action-list", require("./action-list"));
router.use("/inseminator-statistic", require("./inseminator-statistic"));
router.use("/semen-automation", require("./semen-automation"));
router.use("/ntr/product", require("./product"));
router.use("/order", require("./order"));
router.use("/farm", require("./farm"));
router.use("/option", require("./option"));
router.use("/validate", require("./validate"));
router.use("/user", require("./user"));
router.use("/drug-inventory", require("./drug-inventory"));
router.use("/animal", require("./animal"));
router.use("/dashboard", require("./dashboard"));
router.use("/", require("./authenticate"));

module.exports = router;
