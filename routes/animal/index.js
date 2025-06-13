const express = require("express");
const path = require("path");
const router = express.Router();

// serving images of the animal
router.use(
  "/img",
  express.static(path.join(rootPath, "/upload/animal-images/"))
);
router.use("/reminder", require("./reminder"));
router.use("/feed", require("./feed"));
router.use("/note", require("./note"));
router.use("/image", require("./image"));
router.use("/activity-log", require("./activity-log"));
router.use("/genotype-performance", require("./genotypeperformance"));
router.use("/healthrecord", require("./healthrecord"));
router.use("/genebank", require("./genebank"));
router.use("/conception", require("./conception"));
router.use("/performance", require("./performance"));
router.use("/geneticworth", require("./geneticworth"));
router.use("/genotype", require("./genotype"));
router.use("/", require("./animal"));

module.exports = router;
