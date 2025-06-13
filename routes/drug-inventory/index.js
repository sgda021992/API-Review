const express = require("express");
const moment = require("moment");
const router = express.Router();
const db = require(rootPath + "/models");
const auth = require(rootPath + "/middleware/auth");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { success } = require(rootPath + "/helpers/language");
const { logErrorOccurred, notEmpty, getFormattedId } = require(rootPath +
  "/helpers/general");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
const { Drug, ActivityLog } = require(rootPath + "/helpers/controller");

/**
 * @description drug inventory registration
 */
router.post(
  "/",
  auth,
  validate.druginventory_post(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        drugName,
        genericName,
        drugFormate,
        dozeForCalf,
        dozeForCalfUom,
        dozeForDam,
        dozeForDamUom,
        activeIngredients,
        distributor,
        registrationDate,
        manufacturer,
        substituteDrugNo,
        packId,
        packBatchNumber,
        packManufacturedDate,
        packImportedDate,
        PackExpirationDate,
        packTotalVolLeft,
        packOrderId,
        packQtyOrdered,
        packQtyUnit,
        packPrice,
        packPriceCurrency,
        packPayDate,
        packShippingId,
        packShippingDate,
        packOrderStatus,
        specialistId,
        specialistName,
        specialistComment,
        packRecepientAnimalId,
        packRecepientFarmId,
        packRecepientKeeperId,
        packReservationStatus,
        packReservationDate,
        packReservationTimeout,
        packReservationTimeoutDate,
        packReservedByAnimalId,
        packReservedByFarmId,
        packReservedBykeeperId,
        warehouseId,
        locationRackId,
        locationTierId,
        locationPositionId,
        packStorageTemperatureOptId,
        packContainerFormOptId,
        packConsistQty,
        packReleaseId,
        packReleaseDate,
      } = req.body;

      const set = {
        userId,
        drugName,
        genericName,
        drugFormate,
        dozeForCalf,
        dozeForCalfUom,
        dozeForDam,
        dozeForDamUom,
        activeIngredients,
        distributor,
        registrationDate: notEmpty(registrationDate)
          ? moment.utc(registrationDate, process.env.ACCEPT_DATE_FORMAT)
          : undefined,
        manufacturer,
        substituteDrugNo,
        packId,
        packBatchNumber,
        packManufacturedDate: notEmpty(packManufacturedDate)
          ? moment.utc(packManufacturedDate, process.env.ACCEPT_DATE_FORMAT)
          : undefined,
        packImportedDate: notEmpty(packImportedDate)
          ? moment.utc(packImportedDate, process.env.ACCEPT_DATE_FORMAT)
          : undefined,
        PackExpirationDate: notEmpty(PackExpirationDate)
          ? moment.utc(PackExpirationDate, process.env.ACCEPT_DATE_FORMAT)
          : undefined,
        packTotalVolLeft,
        packOrderId,
        packQtyOrdered,
        packQtyUnit,
        packPrice,
        packPriceCurrency,
        packPayDate: notEmpty(packPayDate)
          ? moment.utc(packPayDate, process.env.ACCEPT_DATE_FORMAT)
          : undefined,
        packShippingId,
        packShippingDate: notEmpty(packShippingDate)
          ? moment.utc(packShippingDate, process.env.ACCEPT_DATE_FORMAT)
          : undefined,
        packOrderStatus,
        specialistId,
        specialistName,
        specialistComment,
        packRecepientAnimalId,
        packRecepientFarmId,
        packRecepientKeeperId,
        packReservationStatus,
        packReservationTimeout,
        packReservationDate: notEmpty(packReservationDate)
          ? moment.utc(packReservationDate, process.env.ACCEPT_DATE_FORMAT)
          : undefined,
        packReservationTimeoutDate: notEmpty(packReservationTimeoutDate)
          ? moment.utc(
              packReservationTimeoutDate,
              process.env.ACCEPT_DATE_FORMAT
            )
          : undefined,
        packReservedByAnimalId,
        packReservedByFarmId,
        packReservedBykeeperId,
        warehouseId,
        locationRackId,
        locationTierId,
        locationPositionId,
        packStorageTemperatureOptId,
        packContainerFormOptId,
        packConsistQty,
        packReleaseId,
        packReleaseDate: notEmpty(packReleaseDate)
          ? moment.utc(packReleaseDate, process.env.ACCEPT_DATETIME_FORMAT)
          : undefined,
      };

      // remove undefined values before inserting
      Object.keys(set).forEach((key) => {
        set[key] == undefined || set[key] == null ? delete set[key] : {};
      });

      const t = await db.sequelize.transaction();
      try {
        let drugInventory = await db.DrugInventory.create(set, {
          transaction: t,
        });
        const { id } = drugInventory;

        // genrate and update drug number
        const drugNumber = getFormattedId("DRG", id);
        await db.DrugInventory.update(
          { drugNumber },
          { where: { id }, transaction: t }
        );

        req.activity = {
          performedOnId: drugNumber,
          type: "general",
          action: "DRUG_INV_REG",
          meta: {},
        };
        await ActivityLog.create(req, t);

        await t.commit();

        drugInventory = { drugNumber, ...(await drugInventory.toJSON()) };
        delete drugInventory.id;

        return res.json(
          successRespSync({
            msg: success.DRUG_REGISTERED,
            data: { drugInventory },
          })
        );
      } catch (err) {
        await t.rollback();
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
 * @description fetch list of registered drugs
 */
router.get(
  "/",
  auth,
  validate.listDrugInventory_get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { search } = req.query;

      const attributes = null;
      let where = {};
      if (notEmpty(search)) {
        let searchQuery = [];
        const fields = [
          "drugNumber",
          "drugName",
          "genericName",
          "drugFormate",
          "distributor",
          "manufacturer",
          "specialistName",
          "packReservationStatus",
        ];

        fields.forEach((field) => {
          let query = {};
          query[field] = {
            [db.Sequelize.Op.like]: "%" + search + "%",
          };
          searchQuery.push(query);
        });

        where = { ...where, [db.Sequelize.Op.or]: searchQuery };
      }

      const drugInventory = await Drug.listDrugInventory(
        req,
        attributes,
        where
      );

      return res.json(
        successRespSync({
          msg: success.FETCHED,
          data: { drugInventory },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @desc fetch registered single animal details
 */
router.get(
  "/:drugNumber",
  auth,
  validate.singleDrugInventory_get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { drugNumber } = req.params;

      const attributes = null;
      const where = { drugNumber };
      const drugInventory = await Drug.getDrugInvetoryDetails(
        where,
        attributes
      );

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: { drugInventory },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description drug inventory update
 */
router.put(
  "/",
  auth,
  validate.druginventory_put(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { drugNumber } = req.body;

      await Drug.updateDrugInvetoryDetail(req);

      req.activity = {
        performedOnId: drugNumber,
        type: "general",
        action: "DRUG_INV_UPDATED",
        meta: {},
      };
      await ActivityLog.create(req);

      const drugInventory = await Drug.getDrugInvetoryDetails(
        { drugNumber },
        null
      );

      return res.json(
        successRespSync({
          msg: success.UPDATED,
          data: { drugInventory },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @description deleting drug inventory data with drugid
 */
router.delete(
  "/",
  auth,
  validate.deleteDrugInventory_delete(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { drugNumber } = req.body;

      await db.DrugInventory.destroy({
        where: { drugNumber },
      });

      req.activity = {
        performedOnId: drugNumber,
        type: "general",
        action: "DRUG_INV_DEL",
        meta: {},
      };
      await ActivityLog.create(req);

      return res.json(
        successRespSync({
          msg: success.DELETED,
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;
