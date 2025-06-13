const express = require("express");
const router = express.Router();
const type = require("type-detect");
const auth = require(rootPath + "/middleware/auth");
const db = require(rootPath + "/models");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { error, success } = require(rootPath + "/helpers/language");
const {
  logErrorOccurred,
  notEmpty,
  removeEmptyValuesFromObject,
} = require(rootPath + "/helpers/general");
const { Product, ProductLog, ActivityLog } = require(rootPath +
  "/helpers/controller");

// include sub routes
router.use("/ordered", require("./ordered"));
router.use("/stock", require("./stock"));

/**
 * @desc list count of registered products of each farm
 */
router.get(
  "/counts",
  auth,
  validate.listValidation(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { search } = req.query;

      let where = null;
      // check if search query is not empty
      if (notEmpty(search)) {
        const fields = ["$farm.farmNumber$", "$farm.name$"];
        const searchQuery = fields.map((col) => {
          return {
            [col]: {
              [db.Sequelize.Op.like]: "%" + search + "%",
            },
          };
        });
        // update where condition
        where = { ...where, [db.Sequelize.Op.or]: searchQuery };
      }
      let ntrOrganisation = await Product.countProductsInFarm(req, where, [], notEmpty(search) ? search : null);
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);

      // send response
      return res.json(
        successRespSync({
          msg: ntrOrganisation == null ? respError.NOT_FOUND : success.FETCH,
          data: {
            ntrOrganisation,
          },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @desc farm registration for user/admin
 */
router.post(
  "/",
  auth,
  validate.product.post(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { id: userId } = req.user;
      const {
        farmNumber,
        name,
        productionQty,
        productionUom,
        productionScale,
        stockQty,
        stockUom,
        productCategoriesOptId,
      } = req.body;

      let set = {
        userId,
        farmNumber,
        name,
        productionQty,
        productionUom,
        productionScale,
        stockQty,
        stockUom,
        productCategoriesOptId,
      };

      // remove undefined values before inserting
      Object.keys(set).forEach((key) => {
        set[key] == undefined || set[key] == null ? delete set[key] : {};
      });

      const transaction = await db.sequelize.transaction();

      try {
        let product = await Product.createProduct(set, transaction);
        await ProductLog.create(product, transaction);

        req.activity = {
          performedOnId: product.productNumber,
          type: "general",
          action: "PROD_REG",
          meta: {},
        };
        await ActivityLog.create(req, transaction);

        await transaction.commit();

        return res.json(
          successRespSync({
            msg: success.REGISTERED,
            data: { product },
          })
        );
      } catch (err) {
        console.log(err);
        await transaction.rollback();
        logErrorOccurred(__filename, err);
        return serverError(res);
      }
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @desc update product information
 */
router.put(
  "/",
  auth,
  validate.product.put(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const {
        productNumber,
        productCategoriesOptId,
        farmNumber,
        name,
        productionQty,
        productionUom,
        productionScale,
        stockQty,
      } = req.body;

      let set = {
        farmNumber,
        name,
        productionQty,
        productionUom,
        productionScale,
        stockQty,
        productCategoriesOptId,
      };
      removeEmptyValuesFromObject(set);
      const where = { productNumber };

      const transaction = await db.sequelize.transaction();

      try {
        await Product.update(set, where, transaction);

        req.activity = {
          performedOnId: productNumber,
          type: "general",
          action: "PROD_UPDATE",
          meta: { body: req.body },
        };
        await ActivityLog.create(req, transaction);

        await transaction.commit();

        const product = await Product.getProduct(null, where);

        return res.json(
          successRespSync({
            msg: success.UPDATED,
            data: { product },
          })
        );
      } catch (err) {
        await transaction.rollback();
        logErrorOccurred(__filename, err);
        return serverError(res);
      }
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @desc list products of the farm
 */
router.get(
  "/",
  auth,
  validate.listValidation(),
  validate.product.get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { search, farm: farmNumber } = req.query;
      let attributes = null,
        where = { farmNumber };

      // check if search query is not empty
      if (notEmpty(search)) {
        let searchQuery = [];
        const fields = [
          "productNumber",
          "farmNumber",
          "name",
          "productionQty",
          "productionUom",
          "productionScale",
          "stockQty",
          "stockUom",
        ];
        // create search query
        fields.forEach((field) => {
          let query = {};
          query[field] = {
            [db.Sequelize.Op.like]: "%" + search + "%",
          };
          searchQuery.push(query);
        });
        // add into where condition
        where = { ...where, [db.Sequelize.Op.or]: searchQuery };
      }

      // get farm products
      let products = await Product.listProducts(req, attributes, where);

      if (type(products.rows) == "Array" && notEmpty(products.rows)) {
        products.rows = products.rows.map((product) => {
          const { stockQty } = product;
          return { ...product, stockStatus: getProductStatus(stockQty) };
        });
      }
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);

      return res.json(
        successRespSync({
          msg: products == null ? respError.NOT_FOUND : success.FETCH,
          data: {
            products,
          },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description show product status according to it's stock available
 * @param {*} stockQty
 * @returns product status
 */
function getProductStatus(stockQty) {
  const status = {
    IN_STOCK: { value: "IN STOCK", min: 11, max: Infinity },
    OUT_OF_STOCK: { value: "OUT OF STOCK", min: -Infinity, max: 0 },
    LOW_STOCK: { value: "LOW STOCK", min: 6, max: 10 },
    CRITICALLY_LOW: { value: "CRITICALLY LOW", min: 1, max: 5 },
  };
  // destructure all status
  const { IN_STOCK, OUT_OF_STOCK, LOW_STOCK, CRITICALLY_LOW } = status;

  // descide stock status
  switch (true) {
    case stockQty >= IN_STOCK.min && stockQty <= IN_STOCK.max:
      return IN_STOCK.value;
    case stockQty >= OUT_OF_STOCK.min && stockQty <= OUT_OF_STOCK.max:
      return OUT_OF_STOCK.value;
    case stockQty >= LOW_STOCK.min && stockQty <= LOW_STOCK.max:
      return LOW_STOCK.value;
    case stockQty >= CRITICALLY_LOW.min && stockQty <= CRITICALLY_LOW.max:
      return CRITICALLY_LOW.value;
    default:
      return "UNKNOWN";
  }
}

router.get(
  "/getAllProducts/",
  auth,
  validate.listValidation(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { farmNumber } = req.query;
      let attributes = null;

      let where;
      if (farmNumber) {
        where = { farmNumber };
      }
      // get farm products
      let products = await Product.listProducts(req, attributes, where);
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);
      return res.json(
        successRespSync({
          msg: products == null ? respError.NOT_FOUND : success.FETCH,
          data: {
            products,
          },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;
