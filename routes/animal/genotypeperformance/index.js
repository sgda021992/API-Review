const express = require("express");
const moment = require("moment");
const router = express.Router();
// loading models
const db = require(rootPath + "/models");
// loading middleware
const auth = require(rootPath + "/middleware/auth");
// loading helpers
const { successResp, successRespSync, serverError } = require(rootPath +
  "/helpers/api");
const { error, success } = require(rootPath + "/helpers/language"); // constant messages
const {
  logErrorOccurred,
  notEmpty,
  removeEmptyValuesFromObject,
  getFormattedId,
} = require(rootPath + "/helpers/general"); // constant messages
// validations
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
// load helper controller
const controller = require(rootPath + "/helpers/controller");

/**
 * @description animal genotype performance registration
 */
router.post(
  "/",
  auth,
  validate.genotypeperformance.post(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const userId = req.user.id;
      // destructure the body
      const {
        animalNumber,
        breedId,
        chromosome,
        sequenceChange,
        inheritance,
        diseaseName,
        referenceSequence,
        pubmedReference,
      } = req.body;

      // property to be inserted
      let set = {
        userId,
        animalNumber,
        breedId,
        chromosome,
        sequenceChange,
        inheritance,
        diseaseName,
        referenceSequence,
        pubmedReference,
      };

      // remove empty values before inserting
      removeEmptyValuesFromObject(set);

      // start transaction
      const transaction = await db.sequelize.transaction();

      try {
        // create new record
        let genotypePerformance = await db.AnimalGenotypePerformance.create(
          set,
          { transaction }
        );

        // genrate custom genotype performance number
        const GTPerformanceNumber = getFormattedId(
          "GTPRF",
          genotypePerformance.id
        );

        // update GTPerformanceNumber
        await db.AnimalGenotypePerformance.update(
          { GTPerformanceNumber },
          { where: { id: genotypePerformance.id }, transaction }
        );

        // reformat data
        genotypePerformance = {
          GTPerformanceNumber,
          ...(await genotypePerformance.toJSON()),
          id: undefined,
          userId: undefined,
        };

        // commit transaction
        await transaction.commit();

        // send response back
        return res.json(
          await successResp({
            msg: success.REGISTERED,
            data: {
              genotypePerformance,
            },
          })
        );
      } catch (err) {
        // rollback transaction
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
 * @desc list genotype performance of the all animals
 */
router.get(
  "/",
  auth,
  validate.listValidation(),
  validationErrorHandler,
  async (req, res) => {
    // console.log(req,"||||||||||||||||||||||||||||||||||||||||||||");
    // console.log(req.method,"-----method");
    // console.log(req.baseUrl,"-----baseUrl");
    // console.log(req.originalUrl,"-----originalUrl");
    try {
      // return res.json("this is json");
      const { id: userId } = req.user;
      const { search } = req.query;

      // attribute array
      const attributes = null;
      // condition
      let where = null;
      // check if search query is not empty
      if (notEmpty(search)) {
        let searchQuery = [];
        const fields = [
          "$breed.breedName$",
          "GTPerformanceNumber",
          "chromosome",
          "sequenceChange",
          "inheritance",
          "diseaseName",
          "referenceSequence",
          "pubmedReference",
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

      // fetch data
      let genotypePerformance =
        await controller.AnimalGenotypePerformance.listGenotypesPerformance(
          req,
          attributes,
          where
        );
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);

      // send response
      return res.json(
        successRespSync({
          msg: genotypePerformance == null ? respError.NOT_FOUND : success.FETCH,
          data: {
            genotypePerformance,
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
 * @desc get details of the genotype performance of the user
 */
router.get(
  "/:GTPerformanceNumber",
  auth,
  validate.genotypeperformance.get(),
  validationErrorHandler,
  async (req, res) => {
    try {

      // return res.json(req.originalUrl);
      // return res.json(req.method);
      // return res.json(req.baseUrl);
      const { id: userId } = req.user;
      const { GTPerformanceNumber } = req.params;

      // attribute array
      const attributes = null;
      // condition
      let where = { GTPerformanceNumber };

      // fetch data
      let genotypePerformance =
        await controller.AnimalGenotypePerformance.getGenotypesPerformance(
          req,
          attributes,
          where
        );
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);

      // send response
      return res.json(
        successRespSync({
          msg: genotypePerformance == null ? respError.NOT_FOUND : success.FETCH,
          data: {
            genotypePerformance,
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
 * @description update animal genotype
 */
router.put(
  "/",
  auth,
  validate.genotypeperformance.put(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { GTPerformanceNumber } = req.body;

      // update animal genotype performance with genotype performance number
      await controller.AnimalGenotypePerformance.updateGenotypePerformance(req);

      // send updated animal genotype performance details
      let genotype =
        await controller.AnimalGenotypePerformance.getGenotypesPerformance(
          req,
          null,
          { GTPerformanceNumber }
        );

      // send response
      return res.json(
        successRespSync({
          msg: success.GENOTYPE_PERFORMANCE_UPDATED,
          data: {
            genotype,
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
