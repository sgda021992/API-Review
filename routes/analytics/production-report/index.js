const express = require("express");
const router = express.Router();
const db = require(rootPath + "/models");
const auth = require(rootPath + "/middleware/auth");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { success } = require(rootPath + "/helpers/language");
const { logErrorOccurred, notEmpty } = require(rootPath + "/helpers/general");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
const { Product, ProductLog } = require(rootPath + "/helpers/controller");


/**
 * @description countProducts prooduction report NTR
 */
 router.get(
  "/countProducts",
  auth,
  async (req, res) => {
    try {
      const [diary, semen, meat, totalProducts] = await Promise.all([
        Product.countCategoryRows("diary"),
        Product.countCategoryRows("semen"),
        Product.countCategoryRows("meat"),
        Product.countTotalProducts(),
      ]);

      const counts = { diary, semen, meat, totalProducts };
      productionReport = { counts };

      return res.json(
        successRespSync({
          msg: success.FETCHED,
          data: { productionReport },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description list prooduction report NTR
 */
router.get(
  "/",
  auth,
  validate.productionreport.getProduct(),
  validate.listValidation(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const {
        cat: productCategoriesOptId,
        search,
        farm: farmNumber,
      } = req.query;

      const [diary, semen, meat, totalProducts] = await Promise.all([
        Product.countCategoryRows("diary"),
        Product.countCategoryRows("semen"),
        Product.countCategoryRows("meat"),
        Product.countTotalProducts(),
      ]);

      const attributes = ["name", "productNumber", "farmNumber"];
      let where = { productCategoriesOptId };

      if (notEmpty(search)) {
        const fields = ["name"];
        const searchQuery = fields.map((col) => {
          return {
            [col]: {
              [db.Sequelize.Op.like]: "%" + search + "%",
            },
          };
        });
        where = { ...where, [db.Sequelize.Op.or]: searchQuery };
      }
      if (farmNumber !== null && notEmpty(farmNumber)) {
        where = { ...where, farmNumber };
      }

      let productionReport = await Product.listProducts(req, attributes, where);

      const counts = { diary, semen, meat, totalProducts };
      productionReport = { counts, ...productionReport };

      return res.json(
        successRespSync({
          msg: success.FETCHED,
          data: { productionReport },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description list production history of the specific product
 */
router.get(
  "/:productNumber",
  auth,
  validate.productionreport.getProduction(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { productNumber } = req.params;

      const where = { productNumber };
      const productionReport = await ProductLog.listAll(req, where);

      return res.json(
        successRespSync({
          msg: success.FETCHED,
          data: { productionReport },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;
