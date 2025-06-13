const express = require("express");
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
  getFormattedId,
  isObject,
} = require(rootPath + "/helpers/general"); // constant messages

// validations
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");

// load helper controller
const controller = require(rootPath + "/helpers/controller");

/**
 * @description animal performance registration
 */

router.post(
  "/",
  auth,
  validate.animalperformance.post(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const userId = req.user.id;
      // return res.json(req.body);
      // destructure the body
      const {
        animalNumber,
        proteinYield,
        proteinYieldUom,
        milkYield,
        milkYieldUom,
        fatYield,
        fatYieldUom,
        proteinContent,
        proteinContentUom,
        fatContent,
        fatContentUom,
        milkLactose,
        milkLactoseUom,
        milkUrea,
        milkUreaUom,
        lactationNo,
        lactationLength,
        lactationLengthUom,
        milkingFrequency,
        milkingFrequencyUom,
        currentWeight,
        currentWeightUom,
        postWeaningGain,
        postWeaningGainUom,
        weaningWeight,
        weaningWeightUom,
        avgDailyGain,
        avgDailyGainUom,
        carcasWeight,
        carcasWeightUom,
        weightAtCalving,
        weightAtCalvingUom,
        yearlingWeight,
        yearlingWeightUom,
        somaticCellScore,
        somaticCellScoreUom,
        bodyConditionScore,
        teatScore,
        udderScore,
        totalLongevity,
        docility,
        fertility,
        ageAtFirstCalving,
        ageAtFirstCalvingUom,
        scrotalCircumference,
        scrotalCircumferenceUom,
        estrusDetection,
        presenceOfEstrus,
        matureWeight,
        matureWeightUom,
        matureHeight,
        matureHeightUom,
        footClawSet,
        pulmonaryArterialPressure,
        pulmonaryArterialPressureUom,
        footAngle,
        ribEyeArea,
        ribEyeAreaUom,
        ultrasoundFat,
        ultrasoundFatUom,
        ultrasoundIntramuscularFat,
        ultrasoundIntramuscularFatUom,
        ultrasoundRibEyeArea,
        ultrasoundRibEyeAreaUom,
        fatThickness,
        fatThicknessUom,
        marbling,
        marblingUom,
        dryMatterIntake,
        dryMatterIntakeUom,
        somaticCellScoreUD,
        bodyConditionScoreUD,
        calvingInterval,
        birthEase,
      } = req.body;

      // property to be inserted into animal details
      let set = {
        userId,
        animalNumber,
        proteinYield,
        proteinYieldUom,
        milkYield,
        milkYieldUom,
        fatYield,
        fatYieldUom,
        proteinContent,
        proteinContentUom,
        fatContent,
        fatContentUom,
        milkLactose,
        milkLactoseUom,
        milkUrea,
        milkUreaUom,
        lactationNo,
        lactationLength,
        lactationLengthUom,
        milkingFrequency,
        milkingFrequencyUom,
        currentWeight,
        currentWeightUom,
        postWeaningGain,
        postWeaningGainUom,
        weaningWeight,
        weaningWeightUom,
        avgDailyGain,
        avgDailyGainUom,
        carcasWeight,
        carcasWeightUom,
        weightAtCalving,
        weightAtCalvingUom,
        yearlingWeight,
        yearlingWeightUom,
        somaticCellScore,
        somaticCellScoreUom,
        bodyConditionScore,
        teatScore,
        udderScore,
        totalLongevity,
        docility,
        fertility,
        ageAtFirstCalving,
        ageAtFirstCalvingUom,
        scrotalCircumference,
        scrotalCircumferenceUom,
        estrusDetection,
        presenceOfEstrus,
        matureWeight,
        matureWeightUom,
        matureHeight,
        matureHeightUom,
        footClawSet,
        pulmonaryArterialPressure,
        pulmonaryArterialPressureUom,
        footAngle,
        ribEyeArea,
        ribEyeAreaUom,
        ultrasoundFat,
        ultrasoundFatUom,
        ultrasoundIntramuscularFat,
        ultrasoundIntramuscularFatUom,
        ultrasoundRibEyeArea,
        ultrasoundRibEyeAreaUom,
        fatThickness,
        fatThicknessUom,
        marbling,
        marblingUom,
        dryMatterIntake,
        dryMatterIntakeUom,
        somaticCellScoreUD,
        bodyConditionScoreUD,
        calvingInterval,
      };

      // remove undefined values before inserting
      Object.keys(set).forEach((key) => {
        set[key] == undefined || set[key] == null ? delete set[key] : {};
      });

      // start tansaction
      const t = await db.sequelize.transaction();
      try {
        // insert into DB
        let animalPerformance = await db.AnimalPerformance.create(set, {
          transaction: t,
        });

        req.activity = {
          performedOnId: animalNumber,
          type: "animal",
          action: "ANIMAL_PERFORMANCE_REG",
          meta: {},
        };
        await controller.ActivityLog.create(req, t);

        await t.commit();

        // add animal activity log
        await controller.AnimalActivityLog.addActivityLog(req, {
          action: "ANIMAL_PERFORMANCE_REG",
          animalNumber,
        });

        animalPerformance = {
          ...(await animalPerformance.toJSON()),
          id: undefined,
          userId: undefined,
        };

        return res.json(
          await successResp({
            msg: success.ANIMAL_REGISTERED,
            data: { animalPerformance },
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
 * @description update animal performance data with animal id
 */
router.put(
  "/",
  auth,
  validate.animalperformance.put(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { animalNumber } = req.body;

      // start tansaction
      const transaction = await db.sequelize.transaction();
      try {
        // update animal performance details
        const updateAnimalPerformance =
          await controller.AnimalPerformance.updateAnimalPerformance(
            req,
            transaction
          );

        // update animal details
        const updatedAnimalDetail = await controller.updateAnimalDetail(
          req,
          transaction
        );

        req.activity = {
          performedOnId: animalNumber,
          type: "animal",
          action: "ANIMAL_PERFORMANCE_UPDATE",
          meta: {},
        };
        await controller.ActivityLog.create(req, transaction);

        await transaction.commit();

        // add animal activity log
        await controller.AnimalActivityLog.addActivityLog(req, {
          action: "ANIMAL_PERFORMANCE_UPDATE",
          animalNumber,
        });

        let animalPerformance =
          await controller.AnimalPerformance.getPerformanceData(req, null, {
            animalNumber,
          });

        return res.json(
          await successResp({
            msg: success.UPDATED,
            data: { animalPerformance },
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
 * @desc fetch performance details of registered single animal
 */
router.get(
  "/:animalNumber",
  auth,
  validate.animalperformance.get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { animalNumber } = req.params;

      const where = { animalNumber }; // condition for fetching details
      const attributes = null; // attribute array

      // fetch data
      let animalPerformance =
        await controller.AnimalPerformance.getPerformanceData(
          req,
          attributes,
          where
        );
        const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
        const { respError } = require(rootPath + "/helpers/response/" + language);

      // send response
      return res.json(
        successRespSync({
          msg: animalPerformance == null ? respError.NOT_FOUND : success.FETCH,
          data: { animalPerformance },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;
