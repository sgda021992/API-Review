const express = require("express");
const router = express.Router();
const auth = require(rootPath + "/middleware/auth");
const db = require(rootPath + "/models");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { error, success } = require(rootPath + "/helpers/language");
const {
  logErrorOccurred,
  notEmpty,
  removeEmptyValuesFromObject,
} = require(rootPath + "/helpers/general");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
// file uploading
let params;
const { uploadAny } = require(rootPath + "/middleware/upload.js");
const unlinkFileOnErr = require(rootPath + "/middleware/unlinkFileOnErr");
const { WHITELIST_MIMETYPE, ORDER_IMG_UPLOAD_PATH } = require(rootPath +
  "/helpers/constant");
// controller
const { Order, Farm, ActivityLog } = require(rootPath + "/helpers/controller");

/**
 * @description order creation
 */
params = {
  uploadpath: ORDER_IMG_UPLOAD_PATH,
  whiteListMimeTypes: WHITELIST_MIMETYPE.images,
  maxFileSize: 2,
  fields: [{ name: "attachments", maxCount: 2 }],
};

router.post(
  "/",
  auth,
  uploadAny(params),
  validate.order.post(),
  unlinkFileOnErr,
  validationErrorHandler,
  async (req, res) => {
    try {
      const { farmNumber } = req.body;

      const transaction = await db.sequelize.transaction();

      try {
        const farmAttributes = [
          "farmNumber",
          "name",
          [db.sequelize.col("owner.mobile"), "ownerMobile"],
          "houseNo",
          "street",
          [db.sequelize.col("city.name"), "cityName"],
          [db.sequelize.col("state.name"), "stateName"],
          [db.sequelize.col("country.name"), "countryName"],
        ];

        let [order, farm] = await Promise.all([
          Order.createOrder(req, transaction),
          Farm.getFarm(farmAttributes, { farmNumber }, true),
        ]);

        order = {
          ...order,
          farm,
          createdAt: undefined,
          updatedAt: undefined,
          farmNumber: undefined,
        };

        req.activity = {
          performedOnId: order.orderNumber,
          type: "general",
          action: "ORDER_ADDED",
          meta: {},
        };
        await ActivityLog.create(req, transaction);

        await transaction.commit();

        return res.json(
          successRespSync({
            msg: success.ORDER_BOOKED,
            data: { order },
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
 * @description get order details with order number
 */
router.get(
  "/:orderNumber",
  auth,
  validate.order.get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { orderNumber } = req.params;

      // get order details
      let where = { orderNumber };
      let order = await Order.getOrderDetails(where);
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);

      // send response
      return res.json(
        successRespSync({
          msg: order == null ? respError.NOT_FOUND : success.FETCH,
          data: {
            order,
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
 * @description update order details with order number
 */
router.put(
  "/",
  auth,
  // validate.order.get(),
  // validationErrorHandler,
  async (req, res) => {
    try {
      return res.json("under development");
      const {
        orderNumber,
        farmNumber,
        transactionId,
        transactionDate,
        productName,
        productNumber,
        productQty,
        productQtyUom,
        recipientId,
        recipientName,
        recipientType,
        totalPrice,
        currency,
        address,
        status,
      } = req.body;

      let set = {
        farmNumber,
        transactionId,
        transactionDate: notEmpty(transactionDate)
          ? moment.utc(transactionDate, process.env.ACCEPT_DATETIME_FORMAT)
          : undefined,
        // productName,
        // productNumber,
        // productQty,
        // productQtyUom,
        recipientId,
        recipientName,
        recipientType,
        totalPrice,
        currency,
        address,
        status,
      };
      // remove undefined values before inserting
      removeEmptyValuesFromObject(set);

      const where = { orderNumber };
      await Order.update(set, where);

      // fetch updated order details
      let order = await Order.getOrderDetails(where, null, false);

      return res.json(
        successRespSync({
          msg: success.UPDATED,
          data: {
            order,
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
 * @description update order status only with order number
 */
router.put(
  "/status",
  auth,
  validate.order.putStatus(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { orderNumber, status } = req.body;
      let set = {
        status,
      };

      const where = { orderNumber };
      await Order.update(set, where);

      req.activity = {
        performedOnId: orderNumber,
        type: "general",
        action: "ORDER_STATUS_UPDATED",
        meta: {},
      };
      await ActivityLog.create(req);

      const attributes = ["orderNumber", "status"];
      let order = await Order.getOrderDetails(where, attributes, false);

      return res.json(
        successRespSync({
          msg: success.UPDATED,
          data: {
            order,
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
 * @description list all the orders
 */
router.get(
  "/",
  auth,
  validate.listValidation(),
  validationErrorHandler,
  async (req, res) => {
    try {
      let order = await Order.listAll(req);

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: {
            order,
          },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

router.get(
  "/detailsByProduct/:productNumber",
  auth,
  validate.productionreport.getProduction(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { productNumber } = req.params;
      const { farmNumber } = req.query;


      const where = { productNumber };
      const OrderListByProduct = await Order.listAll(req,where);
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);

      return res.json(
        successRespSync({
          msg: OrderListByProduct == null ? respError.NOT_FOUND : success.FETCH,
          data: { OrderListByProduct },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;
