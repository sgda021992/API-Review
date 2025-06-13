const express = require("express");
const router = express.Router();
const auth = require(rootPath + "/middleware/auth");
const db = require(rootPath + "/models");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { success } = require(rootPath + "/helpers/language");
const { logErrorOccurred } = require(rootPath + "/helpers/general");
const { Product, ActivityLog, ProductLog } = require(rootPath +
  "/helpers/controller");

/**
 * @desc update product stock information
 */
router.put(
  "/",
  auth,
  validate.product.putStock(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { productNumber, stockQty } = req.body;

      const where = { productNumber };
      const result = await db.Product.findOne({ where });
      result.stockQty = parseInt(result.stockQty) + parseInt(stockQty);

      const transaction = await db.sequelize.transaction();

      try {
        await result.save({ transaction });
        await ProductLog.create(
          {
            ...(await result.toJSON()),
            id: undefined,
            createdAt: undefined,
            updatedAt: undefined,
            stockQty,
          },
          transaction
        );

        req.activity = {
          performedOnId: productNumber,
          type: "general",
          action: "PROD_STOCK_ADDED",
          meta: { body: req.body },
        };
        await ActivityLog.create(req, transaction);

        await transaction.commit();

        const product = await Product.getProduct(null, where);

        return res.json(
          successRespSync({
            msg: success.STOCK_ADDED,
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

module.exports = router;
