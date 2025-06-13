// This file contains validations for Animal Conception API endpoints using express-validator

const { check } = require("express-validator");

// English and Spanish response messages for validation errors
const { respError: enLang } = require("./../../helpers/response/en");
const { respError: esLang } = require("./../../helpers/response/es");

/**
 * Validation rules for creating a new animal conception record
 */
exports.post = () => {
  return [
    // Mandatory field: Animal Number
    check("animalNumber")
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.EVENT_HEALTH_REC_ANIMAL_NUMBER,
        es: esLang.EVENT_HEALTH_REC_ANIMAL_NUMBER,
      }),

    // Optional fields that must not be empty if present
    check("matingDate")
      .if(check("matingDate").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.MATING_DATE_REQ,
        es: esLang.MATING_DATE_REQ,
      }),

    check("inseminatorName")
      .if(check("inseminatorName").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.INSAMINATOR_NAME_REQ,
        es: esLang.INSAMINATOR_NAME_REQ,
      }),

    check("inseminatorUserId")
      .if(check("inseminatorUserId").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.INSAMINATOR_USERID_REQ,
        es: esLang.INSAMINATOR_USERID_REQ,
      }),

    check("orgName")
      .if(check("orgName").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.ORG_NAME_REQ,
        es: esLang.ORG_NAME_REQ,
      }),

    check("breedingServiceNo")
      .if(check("breedingServiceNo").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.BREEDER_SERVICE_NO_REQ,
        es: esLang.BREEDER_SERVICE_NO_REQ,
      }),

    check("conceptionMethodOptId")
      .if(check("conceptionMethodOptId").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.CONCEPTION_METHOD_ID_REQ,
        es: esLang.CONCEPTION_METHOD_ID_REQ,
      }),

    check("sireId")
      .if(check("sireId").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.SIRE_ID_REQ,
        es: esLang.SIRE_ID_REQ,
      }),

    check("surrogateDamId")
      .if(check("surrogateDamId").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.SURROGATE_DAM_ID_REQ,
        es: esLang.SURROGATE_DAM_ID_REQ,
      }),

    check("embryoOrgName")
      .if(check("embryoOrgName").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.EMBROYO_ORG_NAME_REQ,
        es: esLang.EMBROYO_ORG_NAME_REQ,
      }),

    check("surrogateDamBreedId")
      .if(check("surrogateDamBreedId").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.SURROGATE_DAM_BREED_ID_REQ,
        es: esLang.SURROGATE_DAM_BREED_ID_REQ,
      }),

    check("sireBreedId")
      .if(check("sireBreedId").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.SIRE_BREED_ID_REQ,
        es: esLang.SIRE_BREED_ID_REQ,
      }),

    check("pregnancyCheckDate")
      .if(check("pregnancyCheckDate").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.PREGNANCY_CHECK_DATE_REQ,
        es: esLang.PREGNANCY_CHECK_DATE_REQ,
      }),

    check("conceptionSuccess")
      .if(check("conceptionSuccess").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.CONCEPTION_SUCCESS_REQ,
        es: esLang.CONCEPTION_SUCCESS_REQ,
      }),

    check("pregnancyCheckOperatorName")
      .if(check("pregnancyCheckOperatorName").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.PREGNANCY_CHECK_OPR_NAME_REQ,
        es: esLang.PREGNANCY_CHECK_OPR_NAME_REQ,
      }),

    check("pregnancyCheckMethod")
      .if(check("pregnancyCheckMethod").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.PREGNANCY_CHECK_METHOD_REQ,
        es: esLang.PREGNANCY_CHECK_METHOD_REQ,
      }),

    check("deliveryDate")
      .if(check("deliveryDate").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.DELIVERY_DATE_REQ,
        es: esLang.DELIVERY_DATE_REQ,
      }),

    check("calfId")
      .if(check("calfId").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.CALF_ID_REQ,
        es: esLang.CALF_ID_REQ,
      }),

    check("birthFarm")
      .if(check("birthFarm").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.BIRTH_FARM_REQ,
        es: esLang.BIRTH_FARM_REQ,
      }),

    check("birthEaseOptId")
      .if(check("birthEaseOptId").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.BIRTH_EASE_OPT_ID_REQ,
        es: esLang.BIRTH_EASE_OPT_ID_REQ,
      }),

    check("birthWeight")
      .if(check("birthWeight").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.BIRTH_WEIGHT_REQ,
        es: esLang.BIRTH_WEIGHT_REQ,
      }),

    check("birthWeightUom")
      .if(check("birthWeightUom").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.BIRTH_WEIGHT_UOM_REQ,
        es: esLang.BIRTH_WEIGHT_UOM_REQ,
      }),
  ];
};

/**
 * Validation rules for fetching a single animal conception record
 * Required query parameters: animalNumber, tab
 */
exports.get = () => {
  return [
    check("animalNumber").trim().notEmpty().escape(),
    check("tab").trim().notEmpty().escape(),
  ];
};

/**
 * Validation rules for fetching all conception records for a tab
 * Required query parameter: tab
 */
exports.getAll = () => {
  return [check("tab").trim().notEmpty().escape()];
};
