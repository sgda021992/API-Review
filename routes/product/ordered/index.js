const express = require("express");
const router = express.Router();
const auth = require(rootPath + "/middleware/auth");
const db = require(rootPath + "/models");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { success } = require(rootPath + "/helpers/language");
const { logErrorOccurred, notEmpty } = require(rootPath + "/helpers/general");
const { Product, Order } = require(rootPath + "/helpers/controller");

/**
 * @descritpion get order history of the product with product id
 */
router.get(
  "/:productNumber",
  auth,
  validate.listValidation(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { search } = req.query;
      let { productNumber } = req.params;
      productNumber = productNumber.trim();

      let attributes = [
        "orderNumber",
        "productNumber",
        "productName",
        "recipientId",
        "recipientName",
        "transactionId",
        "productQty",
        "productQtyUom",
        "totalPrice",
        "currency",
        "status",
      ];

      let where = { productNumber };
      // check if search query is not empty
      if (notEmpty(search)) {
        const fields = attributes;
        const searchQuery = fields.map((col) => {
          return {
            [col]: {
              [db.Sequelize.Op.like]: "%" + search + "%",
            },
          };
        });
        where = { ...where, [db.Sequelize.Op.or]: searchQuery };
      }

      const [
        orderHistory,
        product,
        totalOrderCount,
        deliveredOrderCount,
        pendingOrderCount,
      ] = await Promise.all([
        Product.productOrderHistory(req, where, attributes),
        Product.getProduct(["productNumber", "name", "stockQty", "stockUom"], {
          productNumber,
        }),
        Order.ordersCount({ productNumber }),
        Order.ordersCount({
          productNumber,
          status: "delivered",
        }),
        Order.ordersCount({
          productNumber,
          status: "pending",
        }),
      ]);

      // re-format response
      const formattedRes = {
        totalOrderCount,
        deliveredOrderCount,
        pendingOrderCount,
        product,
        ...orderHistory,
      };

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: {
            orderHistory: formattedRes,
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
