// This file contains validation logic for Animal Genotype APIs (create, update, get, list)
const { check, oneOf } = require("express-validator");
const { checkAnimalNo, animalHasHealthRecord } = require("./custom");
const { AnimalGenotype } = require(rootPath + "/helpers/controller");
const { respError: enLang } = require("./../../helpers/response/en");
const { respError: esLang } = require("./../../helpers/response/es");

/**
 * Custom validator to check if animal number is unique in the genotype table.
 * Throws error if the animal number already exists.
 */
const checkUniqueAnimalNumber = async (animalNumber, { req }) => {
  const status = await AnimalGenotype.getGenotypeDetails(req, null, { animalNumber });
  const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
  const { respError } = require(rootPath + "/helpers/response/" + language);
  if (status !== null) throw new Error(); // Already exists
};

/**
 * Custom validator to check if animal number exists in the genotype table.
 * Throws error if not found.
 */
const checkAnimalNumberExist = async (animalNumber, { req }) => {
  const status = await AnimalGenotype.getGenotypeDetails(req, null, { animalNumber });
  const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
  const { respError } = require(rootPath + "/helpers/response/" + language);
  if (status === null) throw new Error(); // Does not exist
};

/**
 * Validation rules for creating/registering a new animal genotype record.
 */
exports.post = () => {
  return [
    check("animalNumber")
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.EVENT_HEALTH_REC_ANIMAL_NUMBER, es: esLang.EVENT_HEALTH_REC_ANIMAL_NUMBER })
      .escape()
      .custom(checkAnimalNo)
      .custom(checkUniqueAnimalNumber)
      .withMessage({ en: enLang.TASK_DUPLICATE_ANIMAL, es: esLang.TASK_DUPLICATE_ANIMAL }),

    check("genotypeAnimalId")
      .if(check("genotypeAnimalId").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.GENOTYPE_ANIMALID_IS_REQUIRED, es: esLang.GENOTYPE_ANIMALID_IS_REQUIRED })
      .escape(),

    check("technicianName")
      .if(check("technicianName").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.TECHNICIAM_NAME_IS_REQUIRED, es: esLang.TECHNICIAM_NAME_IS_REQUIRED })
      .escape(),

    check("genoTypeData")
      .if(check("genoTypeData").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.GENOTYPE_DATA_IS_REQUIRED, es: esLang.GENOTYPE_DATA_IS_REQUIRED })
      .escape(),

    check("genotypingServiceNote")
      .if(check("genotypingServiceNote").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.GENOTYPE_SERVICE_NOTE_IS_REQUIRED, es: esLang.GENOTYPE_SERVICE_NOTE_IS_REQUIRED })
      .escape(),

    check("numberOfSNP")
      .if(check("numberOfSNP").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.NUMBER_OF_SNP_IS_REQUIRED, es: esLang.NUMBER_OF_SNP_IS_REQUIRED })
      .isFloat()
      .withMessage({ en: enLang.MUST_BE_A_NUM, es: esLang.MUST_BE_A_NUM })
      .escape(),
  ];
};

/**
 * Validation rules for updating an existing animal genotype record.
 */
exports.put = () => {
  return [
    check("animalNumber")
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.EVENT_HEALTH_REC_ANIMAL_NUMBER, es: esLang.EVENT_HEALTH_REC_ANIMAL_NUMBER })
      .escape()
      .custom(checkAnimalNumberExist)
      .withMessage({ en: enLang.ANIMAL_NOT_EXIST, es: esLang.ANIMAL_NOT_EXIST }),

    check("genotypeAnimalId")
      .if(check("genotypeAnimalId").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.GENOTYPE_ANIMALID_IS_REQUIRED, es: esLang.GENOTYPE_ANIMALID_IS_REQUIRED })
      .escape(),

    check("technicianName")
      .if(check("technicianName").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.TECHNICIAM_NAME_IS_REQUIRED, es: esLang.TECHNICIAM_NAME_IS_REQUIRED })
      .escape(),

    check("genoTypeData")
      .if(check("genoTypeData").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.GENOTYPE_DATA_IS_REQUIRED, es: esLang.GENOTYPE_DATA_IS_REQUIRED })
      .escape(),

    check("genotypingServiceNote")
      .if(check("genotypingServiceNote").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.GENOTYPE_SERVICE_NOTE_IS_REQUIRED, es: esLang.GENOTYPE_SERVICE_NOTE_IS_REQUIRED })
      .escape(),

    check("numberOfSNP")
      .if(check("numberOfSNP").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.NUMBER_OF_SNP_IS_REQUIRED, es: esLang.NUMBER_OF_SNP_IS_REQUIRED })
      .isFloat()
      .withMessage({ en: enLang.MUST_BE_A_NUM, es: esLang.MUST_BE_A_NUM })
      .escape(),
  ];
};

/**
 * Validation rules to get genotype details for a specific animal.
 */
exports.get = () => {
  return [
    check("animalNumber")
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.EVENT_HEALTH_REC_ANIMAL_NUMBER, es: esLang.EVENT_HEALTH_REC_ANIMAL_NUMBER })
      .escape(),
  ];
};

/**
 * Validation rules for fetching paginated list of animal genotype records (gene bank).
 */
exports.getAll = () => {
  return [
    check("page")
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.PAGE_IS_REQ, es: esLang.PAGE_IS_REQ })
      .isInt({ min: 1 })
      .escape(),

    check("limit")
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.LIMIT_IS_REQ, es: esLang.LIMIT_IS_REQ })
      .isInt({ min: 1 })
      .escape(),

    check("search")
      .if(check("search").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.SEARCH_VAL_REQ, es: esLang.SEARCH_VAL_REQ })
      .isString()
      .escape(),

    check("col")
      .if(check("col").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.COL_REQ, es: esLang.COL_REQ })
      .escape(),

    check("desc")
      .if(check("col").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.DESC_REQ, es: esLang.DESC_REQ })
      .isIn(["true", "false"])
      .escape(),
  ];
};
