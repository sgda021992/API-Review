const express = require("express");
const router = express.Router();
const moment = require("moment");
const db = require(rootPath + "/models");
const auth = require(rootPath + "/middleware/auth");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { error, success } = require(rootPath + "/helpers/language");
const { logErrorOccurred, notEmpty, getFormattedId } = require(rootPath +
  "/helpers/general");
const controller = require(rootPath + "/helpers/controller");

/**
 * @desc farm registration for user/admin
 */
router.post(
  "/",
  auth,
  validate.adminFarmPost(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const ACCEPT_FORMAT = process.env.ACCEPT_DATE_FORMAT;
      const { id: userId } = req.user;

      const {
        govRegistrationNo,
        name,
        ownerId,
        farmType,
        farmOwnershipType,
        contractMating,
        productionSystemOptId,
        cooperativeID,
        licenceNumber,
        licenceED,
        regulatorName,
        regulatorRepName,
        countryId,
        stateId,
        cityId,
        villageId,
        street,
        houseNo,
        farmSize,
        farmSizeUomId,
        farmPerimeter,
        farmPerimeterUomId,
        lat,
        log,
        communityName,
        isPrimaryFarm,
        isDeleted,
      } = req.body;

      let set = {
        userId,
        govRegistrationNo,
        name,
        ownerId,
        farmType,
        farmOwnershipType,
        contractMating,
        productionSystemOptId,
        cooperativeID,
        licenceNumber,
        licenceED: notEmpty(licenceED)
          ? moment.utc(licenceED, ACCEPT_FORMAT)
          : undefined,
        regulatorName,
        regulatorRepName,
        countryId,
        stateId,
        cityId,
        villageId,
        street,
        houseNo,
        farmSize,
        farmSizeUomId,
        farmPerimeter,
        farmPerimeterUomId,
        lat,
        log,
        communityName,
        isPrimaryFarm,
        isDeleted,
      };

      // remove undefined values before inserting
      Object.keys(set).forEach((key) => {
        set[key] == undefined || set[key] == null ? delete set[key] : {};
      });

      const transaction = await db.sequelize.transaction();

      try {
        let farm = await db.Farm.create(set, { transaction });
        const farmId = farm.id;

        // genrate custom farm number for farm
        const farmNumber = getFormattedId("FRM", farmId);

        let [update] = await db.Farm.update(
          { farmNumber },
          { where: { id: farmId }, transaction }
        );

        req.activity = {
          performedOnId: farmNumber,
          type: "farm",
          action: "FARM_REG",
          meta: {},
        };
        await controller.ActivityLog.create(req, transaction);

        await transaction.commit();

        farm = await farm.toJSON();
        farm = { ...farm, farmNumber, userId: undefined, id: undefined };

        return res.json(
          successRespSync({
            msg: success.FARM_REGISTERED,
            data: farm,
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
 * @desc update farm details
 */
router.put(
  "/",
  auth,
  validate.adminFarmPut(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const ACCEPT_FORMAT = process.env.ACCEPT_DATE_FORMAT;

      const {
        farmNumber,
        govRegistrationNo,
        name,
        ownerId,
        farmType,
        farmOwnershipType,
        contractMating,
        productionSystemOptId,
        cooperativeID,
        licenceNumber,
        licenceED,
        regulatorName,
        regulatorRepName,
        countryId,
        stateId,
        villageId,
        cityId,
        street,
        houseNo,
        farmSize,
        farmSizeUomId,
        farmPerimeter,
        farmPerimeterUomId,
        lat,
        log,
        communityName,
        isPrimaryFarm,
        isDeleted,
      } = req.body;

      let set = {
        govRegistrationNo,
        name,
        ownerId,
        farmType,
        farmOwnershipType,
        contractMating,
        productionSystemOptId,
        cooperativeID,
        licenceNumber,
        licenceED: notEmpty(licenceED)
          ? moment.utc(licenceED, ACCEPT_FORMAT)
          : undefined,
        regulatorName,
        regulatorRepName,
        countryId,
        stateId,
        villageId,
        cityId,
        street,
        houseNo,
        farmSize,
        farmSizeUomId,
        farmPerimeter,
        farmPerimeterUomId,
        lat,
        log,
        communityName,
        isPrimaryFarm,
        isDeleted,
      };

      Object.keys(set).forEach((key) => {
        set[key] == undefined || set[key] == null ? delete set[key] : {};
      });

      let [updated] = await db.Farm.update(set, { where: { farmNumber } });

      if (updated) {
        req.activity = {
          performedOnId: farmNumber,
          type: "farm",
          action: "FARM_UPDATED",
          meta: {},
        };
        await controller.ActivityLog.create(req);

        var farm = await db.Farm.findOne({
          attributes: {
            exclude: [
              "id",
              "isDeleted",
              "updatedAt",
              "isPrimaryFarm",
              "communityName",
            ],
          },
          where: { farmNumber },
        });
      }
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);

      return res.json(
        successRespSync({
          msg: updated ? success.FARM_UPDATED : respError.NOT_FOUND,
          data: farm,
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @desc fetch registered farm
 */
router.get(
  "/",
  auth,
  validate.farm_get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      let where = {};
      const { search } = req.query;
      let attributes = [
        "farmNumber",
        "govRegistrationNo",
        "cooperativeID",
        // "ownerName",
        "farmType",
        "contractMating",
      ];

      // check if search query is not empty
      if (notEmpty(search)) {
        let searchQuery = [];
        const fields = [
          "farmNumber",
          "govRegistrationNo",
          "cooperativeID",
          // "name",
          "farmType",
          "contractMating",
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
      // load farm controller and call listAllFarms function
      const farm = require(rootPath + "/helpers/controller");
      const { count: totalRows, rows } = await farm.listAllFarms(
        req,
        attributes,
        where
      );

      // send response
      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: {
            numRows: rows.length,
            totalRows,
            rows,
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
 * @desc fetch registered single farm
 */
router.get(
  "/:farmNumber",
  auth,
  validate.individualFarm_get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { farmNumber } = req.params;

      let farmData = await db.Farm.findOne({
        include: [
          {
            model: db.Option,
            as: "productionSystem",
            attributes: ["id", "name"],
          },
          {
            model: db.User,
            as: "owner",
            attributes: ["userNumber", "name"],
          },
          {
            model: db.Country,
            as: "country",
            attributes: ["id", "name"],
          },
          {
            model: db.State,
            as: "state",
            attributes: ["id", "name"],
          },
          {
            model: db.City,
            as: "city",
            attributes: ["id", "name"],
          },
          {
            model:db.Village,
            as:"village",
            attributes:["id", "name"]
          }
        ],
        attributes: [
          [
            db.sequelize.literal(
              "(select farmNumber from farms where id=(SELECT MAX(id) as id FROM farms where id<Farm.id))"
            ),
            "prevFarmNumber",
          ],
          [
            db.sequelize.literal(
              "(select farmNumber from farms where id=(SELECT MIN(id) as id FROM farms where id>Farm.id))"
            ),
            "nextFarmNumber",
          ],
          "farmNumber",
          "govRegistrationNo",
          "name",
          "farmType",
          "farmOwnershipType",
          "contractMating",
          "cooperativeID",
          "licenceNumber",
          "licenceED",
          "regulatorName",
          "regulatorRepName",
          "street",
          "houseNo",
          "farmSize",
          "farmSizeUomId",
          "farmPerimeter",
          "farmPerimeterUomId",
          "lat",
          "log",
          ["createdAt", "registeredAt"],
        ],
        where: { farmNumber },
      });

      farmData = await farmData.toJSON();

      farmData = {
        ...farmData,
        ...farmData.user,
        registeredAt: moment(farmData.registeredAt).format(
          process.env.ACCEPT_DATE_FORMAT
        ),
      };

      // get counts of following
      const { damCount, heiferCount } = await controller.countHeiferAndDam({
        farmNumber,
      });
      const sireCount = await controller.sireCount({ farmNumber });
      const calfCount = await controller.calfCount({ farmNumber });
      const steerCount = await controller.steerCount({ farmNumber });
      const totalAnimals = await controller.countTotalAnimals({ farmNumber });
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);

      return res.json(
        successRespSync({
          msg: farmData == null ? respError.NOT_FOUND : success.FETCH,
          data: {
            animalCount: {
              damCount,
              heiferCount,
              sireCount,
              calfCount,
              steerCount,
              totalAnimals,
            },
            ...farmData,
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
