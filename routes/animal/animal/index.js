const express = require("express");
const moment = require("moment");
const router = express.Router();
const db = require(rootPath + "/models");
const auth = require(rootPath + "/middleware/auth");
const {
  successResp,
  errorResp,
  successRespSync,
  serverError,
} = require(rootPath + "/helpers/api");
const xlsx = require(rootPath + "/middleware/xlsx");
const { error, success } = require(rootPath + "/helpers/language");
const { logErrorOccurred, notEmpty, getFormattedId } = require(rootPath +
  "/helpers/general");
const {
  WHITELIST_MIMETYPE,
  ANIMAL_IMAGE_UPLOAD_PATH,
  ANIMAL_IMAGE_URL,
} = require(rootPath + "/helpers/constant");
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
// file upload normally without AWS
const { uploadAny, uploadSingleBuffer } = require(rootPath + "/middleware/upload.js");

const unlinkFileOnErr = require(rootPath + "/middleware/unlinkFileOnErr");
const controller = require(rootPath + "/helpers/controller");

/**
 * @description animal registration
 */
// file upload functionality for uploading animal image
let params;
const uploadParam = {
  whiteListMimeTypes: [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  maxFileSize: 5,
  fieldName: "animal",
};

// params for file uploading
params = {
  uploadpath: ANIMAL_IMAGE_UPLOAD_PATH,
  whiteListMimeTypes: WHITELIST_MIMETYPE.images,
  maxFileSize: 2,
  fields: [{ name: "animalImg", maxCount: 2 }],
};

router.post(
  "/",
  auth,
  uploadAny(params),
  validate.animal_post(),
  unlinkFileOnErr,
  validationErrorHandler,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const ACCEPT_FORMAT = process.env.ACCEPT_DATE_FORMAT;

      // return res.json(req.body);
      const {
        tagType,
        farmNumber,
        tagNumber,
        registrationNumber,
        birthWeight,
        birthEase,
        birthFarmId,
        ownerName,
        ownerUserNumber,
        sirePubId,
        damPubId,
        surrogateDamPubId,
        breed,
        // breedId,
        conceptionMethod,
        gender,
        dob,
        operator,
        operatorNumber,
        animalRemovedFarmId,
        animalRemovalDate,
        removedAnimalDestination,
        animalRemovalReason,
        animalPicture,
        name,
        trackingNumber,
        brand,
        tattoo,
        hornStatus,
        origin,
        // countryId,
        previousOwnerName,
        twin,
        breedAssociationName,
        breedAssociationRegNo,
        breeder,
        note,
        steer,
      } = req.body;

      let set = {
        userId,
        farmNumber: farmNumber ?? birthFarmId,
        tagType,
        tagNumber,
        registrationNumber,
        birthWeight,
        birthEase,
        birthFarmId,
        ownerName,
        ownerUserNumber,
        sirePubId,
        damPubId,
        surrogateDamPubId,
        breed,
        // breedId,
        conceptionMethod,
        gender,
        dob: moment.utc(dob, ACCEPT_FORMAT),
        operator,
        operatorNumber,
        animalRemovedFarmId,
        animalRemovalDate,
        removedAnimalDestination,
        animalRemovalReason,
        animalPicture,
        name,
        trackingNumber,
        brand,
        tattoo,
        hornStatus,
        origin,
        // countryId,
        previousOwnerName,
        twin,
        breedAssociationName,
        breedAssociationRegNo,
        breeder,
        steer,
      };

      // remove undefined values before inserting
      Object.keys(set).forEach((key) => {
        set[key] == undefined || set[key] == null ? delete set[key] : {};
      });

      // start tansaction
      const t = await db.sequelize.transaction();
      try {
        // insert into DB
        let animal = await db.Animal.create(set, { transaction: t });
        const { id } = animal; // animal id

        // genrate public id of animal
        const animalNumber = getFormattedId("ANI", id);
        animal['animalNumber'] = animalNumber;
        const animalDetails = await controller.getAnimalType(animal);
        const animalCategory = await db.AnimalCategory.findOne({ where: { category: animalDetails } });
        // update public id of the animal
        await db.Animal.update(
          { animalNumber, categoryId: animalCategory.id },
          { where: { id }, transaction: t },
        );
        // check if req.files array is not empty #upload image
        if (notEmpty(req.files.animalImg)) {
          // create array of file to be saved into DB
          let animalImgArr = req.files.animalImg.map((file) => {
            const { filename, originalname } = file;
            const extension = filename.split(".").pop();
            return {
              userId,
              animalNumber,
              originalName: originalname,
              imageName: filename,
              imageType: extension,
            };
          });
          // save animal images into DB
          await db.AnimalImage.bulkCreate(animalImgArr, { transaction: t });
        }

        // check if note is set
        if (notEmpty(note)) {
          const setNote = { userId, animalNumber, note };
          await controller.AnimalNote.addNote(req, setNote, t);
        }

        // add animal activity log
        await controller.AnimalActivityLog.addActivityLog(req, {
          action: "ANIMAL_REGISTERED",
          animalNumber,
        });

        req.activity = {
          performedOnId: animalNumber,
          type: "animal",
          action: "ANIMAL_REGISTERED",
          meta: {},
        };
        await controller.ActivityLog.create(req, t);

        // commit if everything is good
        await t.commit();

        animal = { animalNumber, ...(await animal.toJSON()) };
        delete animal.id;
        // send response back
        return res.json(
          await successResp({
            msg: success.ANIMAL_REGISTERED,
            data: { animal },
          })
        );
      } catch (err) {
        await t.rollback();
        console.log(err);
        logErrorOccurred(__filename, err);
        return res.status(error.code.SERVER_ERROR).json(await errorResp());
      }
    } catch (err) {
      logErrorOccurred(__filename, err);
      return res.status(error.code.SERVER_ERROR).json(await errorResp());
    }
  }
);

/**
 * @description update animal details with animal id
 */
router.put(
  "/",
  auth,
  validate.animal_put(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const { animalNumber } = req.body;

      await controller.updateAnimalDetail(req);

      // fetch animal updated details
      const where = { animalNumber };
      const attributes = null;
      const animalDetails = await controller.getAnimalDetails(
        where,
        attributes
      );

      // add animal activity log
      await controller.AnimalActivityLog.addActivityLog(req, {
        action: "ANIMAL_DETAILS_UPDATED",
        animalNumber,
      });

      req.activity = {
        performedOnId: animalNumber,
        type: "animal",
        action: "ANIMAL_DETAILS_UPDATED",
        meta: {},
      };
      await controller.ActivityLog.create(req);

      return res.json(
        await successResp({
          msg: success.UPDATED,
          data: { animalDetails },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return res.status(error.code.SERVER_ERROR).json(await errorResp());
    }
  }
);

/**
 * @description Fetch all the animal list
 */
router.get(
  "/",
  auth,
  validate.animal_get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      let where = {};
      let attributes = [
        "animalNumber",
        "farmNumber",
        "tagType",
        "tagNumber",
        "registrationNumber",
        "birthWeight",
        "birthEase",
        "birthFarmId",
        "ownerName",
        "sirePubId",
        "damPubId",
        "surrogateDamPubId",
        "breedId",
        "breed",
        "conceptionMethod",
        "gender",
        "dob",
        "operator",
        "animalRemovedFarmId",
        "animalRemovalDate",
        "removedAnimalDestination",
        "animalRemovalReason",
        "name",
        "trackingNumber",
        "brand",
        "tattoo",
        "hornStatus",
        "countryId",
        "origin",
        "previousOwnerName",
        "twin",
        "breedAssociationName",
        "breedAssociationRegNo",
        "breeder",
        "note",
        "steer",
        "status",
        "createdAt",
      ];
      const { list, search } = req.query;

      if (notEmpty(search)) {
        let searchQuery = [];
        const fields = attributes;

        fields.forEach((field) => {
          let query = {};
          query[field] = {
            [db.Sequelize.Op.like]: "%" + search + "%",
          };
          searchQuery.push(query);
        });

        where = { ...where, [db.Sequelize.Op.or]: searchQuery };
      }

      // date limit for calf
      const calfPeriod = process.env.CALF_PERIOD;
      const greaterThen = moment.utc().subtract(calfPeriod, "days");
      let tempSQL = "";
      switch (list) {
        case "calf": {
          where = { ...where, dob: { [db.Sequelize.Op.gt]: greaterThen } };
          break;
        }
        case "steer": {
          // steer consist of steer male and non sire male
          where = {
            ...where,
            gender: "male",
            dob: { [db.Sequelize.Op.lt]: greaterThen },
          };
          break;
        }
        case "heifer": {
          tempSQL =
            "SELECT DISTINCT `damPubId` FROM `animals` WHERE damPubId IS NOT null";
          where = {
            ...where,
            animalNumber: {
              [db.Sequelize.Op.notIn]: db.sequelize.literal(`(${tempSQL})`),
            },
            gender: "female",
            dob: { [db.Sequelize.Op.lt]: greaterThen },
          };
          break;
        }
        case "dam": {
          tempSQL =
            "SELECT DISTINCT `damPubId` FROM `animals` WHERE damPubId IS NOT null";
          where = {
            ...where,
            animalNumber: {
              [db.Sequelize.Op.in]: db.sequelize.literal(`(${tempSQL})`),
            },
            gender: "female",
            dob: { [db.Sequelize.Op.lt]: greaterThen },
          };
          break;
        }
        case "sire": {
          tempSQL =
            "SELECT DISTINCT `sirePubId` FROM `animals` WHERE sirePubId IS NOT null";
          where = {
            ...where,
            animalNumber: {
              [db.Sequelize.Op.in]: db.sequelize.literal(`(${tempSQL})`),
            },
            gender: "male",
            dob: { [db.Sequelize.Op.lt]: greaterThen },
          };
          break;
        }
      }

      let [
        { count: totalRows, rows },
        { damCount, heiferCount },
        sireCount,
        calfCount,
        steerCount,
        totalAnimals,
      ] = await Promise.all([
        controller.listAllAnimals(req, attributes, where, false),
        controller.countHeiferAndDam(),
        controller.sireCount(),
        controller.calfCount(),
        controller.steerCount(),
        controller.countTotalAnimals(),
      ]);
      // restructure data
      rows = await Promise.all(
        rows.map(async (row) => {
          row = await row.toJSON();
          row.createdAt = moment(row.createdAt).format(
            process.env.ACCEPT_DATE_FORMAT
          );
          // add img url if row not empty
          if (row.img != null && row.img != undefined) {
            row.img.url = ANIMAL_IMAGE_URL + row.img.imageName;
          }
          return row;
        })
      );

      return res.json(
        successRespSync({
          msg: success.FETCH,
          data: {
            damCount,
            sireCount,
            calfCount,
            heiferCount,
            steerCount,
            totalAnimals,
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
 * @desc fetch registered single animal details
 */
router.get(
  "/:animalNumber",
  auth,
  validate.animaldetails_byid_get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { animalNumber } = req.params;

      // load animal controller
      const animal = require(rootPath + "/helpers/controller");

      const where = { animalNumber }; // condition for fetching details
      const attributes = null; // attribute array
      const animalDetails = await animal.getAnimalDetails(where, attributes);
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);

      // send response
      return res.json(
        successRespSync({
          msg: animalDetails == null ? respError.NOT_FOUND : success.FETCH,
          data: { animalDetails },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

router.post(
  "/import",
  auth,
  uploadSingleBuffer(uploadParam),
  xlsx,
  validate.importAnimal(),
  validationErrorHandler,
  async (req, res) => {
    try {
      req.body = req.body.map((element) => {
        element['userID'] = req.user.id;
        return element;
      })
      const animalImportHistory = await controller.importAnimal(req.body)
      return res.json(
        successRespSync({
          msg: success.ANIMAL_IMPORTED,
          data: animalImportHistory,
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;
