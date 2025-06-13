// This file contains validations for Animal Genetic Worth endpoints using express-validator

const dateFormat = "MM/DD/YYYY";
const { check } = require("express-validator");

// Custom validation functions
const {
  doAnimalHasGeneticWorth,
  checkAnimalNo,
  isAnimalInAnimalGeneticWorth,
} = require("./custom");

// Language-based error message objects
const { respError: enLang } = require("./../../helpers/response/en");
const { respError: esLang } = require("./../../helpers/response/es");

// ========== POST: Register animal genetic worth ==========
exports.post = () => {
  return [
    // Validate animal number - required, must exist, and should not already have genetic worth recorded
    check("animalNumber")
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.EVENT_HEALTH_REC_ANIMAL_NUMBER,
        es: esLang.EVENT_HEALTH_REC_ANIMAL_NUMBER
      })
      .escape()
      .custom(checkAnimalNo)
      .custom(doAnimalHasGeneticWorth)
      .withMessage({
        en: enLang.ANIMAL_GENETIC_REQ,
        es: esLang.ANIMAL_GENETIC_REQ
      }),

    // Optional fields: Validate only if present and not empty
    check("BVMethod")
      .if(check("BVMethod").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.BVMETHOD_REQ, es: esLang.BVMETHOD_REQ }),

    check("BVSoftware")
      .if(check("BVSoftware").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.BVSOFTWARE_REQ, es: esLang.BVSOFTWARE_REQ }),

    check("scriptsPath")
      .if(check("scriptsPath").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.SCRIPT_PATH_REQ, es: esLang.SCRIPT_PATH_REQ }),

    check("DPYBValue")
      .if(check("DPYBValue").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.DPYB_VALUE_REQ, es: esLang.DPYB_VALUE_REQ }),

    check("DPYBValueAccuracy")
      .if(check("DPYBValueAccuracy").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.DPYB_VALUE_ACCURACY_REQ, es: esLang.DPYB_VALUE_ACCURACY_REQ }),

    check("DPYBValuePercent")
      .if(check("DPYBValuePercent").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.DPYB_VALUE_PERCENT_REQ, es: esLang.DPYB_VALUE_PERCENT_REQ }),

    check("DPYBValueRank")
      .if(check("DPYBValueRank").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.DPYB_VALUE_RANK_REQ, es: esLang.DPYB_VALUE_RANK_REQ }),

    check("EI")
      .if(check("EI").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.EI_REQ, es: esLang.EI_REQ }),

    check("EIAccuracy")
      .if(check("EIAccuracy").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.EIACCURACY_REQ, es: esLang.EIACCURACY_REQ }),

    check("EIAccuracyPercent")
      .if(check("EIAccuracyPercent").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.EIACCURACY_PERCENT_REQ, es: esLang.EIACCURACY_PERCENT_REQ }),

    check("EIRank")
      .if(check("EIRank").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.EIRANK_REQ, es: esLang.EIRANK_REQ }),

    check("DPYWight")
      .if(check("DPYWight").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.DPYWIGHT_REQ, es: esLang.DPYWIGHT_REQ }),

    check("DPYWightUom")
      .if(check("DPYWightUom").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.DPYWIGHT_UOM_REQ, es: esLang.DPYWIGHT_UOM_REQ })
      .isIn(["kg"]),

    check("DPYUsed")
      .if(check("DPYUsed").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.DPYUSED_REQ, es: esLang.DPYUSED_REQ }),
  ];
};

// ========== GET: Fetch animal genetic worth ==========
exports.get = () => {
  return [
    // Validate animal number - must exist in genetic worth table
    check("animalNumber")
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.EVENT_HEALTH_REC_ANIMAL_NUMBER,
        es: esLang.EVENT_HEALTH_REC_ANIMAL_NUMBER
      })
      .escape()
      .custom(isAnimalInAnimalGeneticWorth),
  ];
};

// ========== PUT: Update animal genetic worth ==========
exports.put = () => {
  return [
    // Validate animal number - must exist in genetic worth table
    check("animalNumber")
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.EVENT_HEALTH_REC_ANIMAL_NUMBER,
        es: esLang.EVENT_HEALTH_REC_ANIMAL_NUMBER
      })
      .escape()
      .custom(isAnimalInAnimalGeneticWorth),

    // Redundant validation (possibly needed for frontend checks)
    check("animalNumber")
      .if(check("animalNumber").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.EVENT_HEALTH_REC_ANIMAL_NUMBER,
        es: esLang.EVENT_HEALTH_REC_ANIMAL_NUMBER
      }),

    // Optional fields - validate if present
    check("BVMethod")
      .if(check("BVMethod").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.BVMETHOD_REQ, es: esLang.BVMETHOD_REQ }),

    check("BVSoftware")
      .if(check("BVSoftware").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.BVSOFTWARE_REQ, es: esLang.BVSOFTWARE_REQ }),

    check("scriptsPath")
      .if(check("scriptsPath").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.SCRIPT_PATH_REQ, es: esLang.SCRIPT_PATH_REQ }),

    check("DPYBValue")
      .if(check("DPYBValue").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.DPYB_VALUE_REQ, es: esLang.DPYB_VALUE_REQ }),

    check("DPYBValueAccuracy")
      .if(check("DPYBValueAccuracy").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.DPYB_VALUE_ACCURACY_REQ, es: esLang.DPYB_VALUE_ACCURACY_REQ }),

    check("DPYBValuePercent")
      .if(check("DPYBValuePercent").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.DPYB_VALUE_PERCENT_REQ, es: esLang.DPYB_VALUE_PERCENT_REQ }),

    check("DPYBValueRank")
      .if(check("DPYBValueRank").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.DPYB_VALUE_RANK_REQ, es: esLang.DPYB_VALUE_RANK_REQ }),

    check("EI")
      .if(check("EI").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.EI_REQ, es: esLang.EI_REQ }),

    check("EIAccuracy")
      .if(check("EIAccuracy").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.EIACCURACY_REQ, es: esLang.EIACCURACY_REQ }),

    check("EIAccuracyPercent")
      .if(check("EIAccuracyPercent").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.EIACCURACY_PERCENT_REQ, es: esLang.EIACCURACY_PERCENT_REQ }),

    check("EIRank")
      .if(check("EIRank").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.EIRANK_REQ, es: esLang.EIRANK_REQ }),

    check("DPYWight")
      .if(check("DPYWight").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.DPYWIGHT_REQ, es: esLang.DPYWIGHT_REQ }),

    check("DPYWightUom")
      .if(check("DPYWightUom").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.DPYWIGHT_UOM_REQ, es: esLang.DPYWIGHT_UOM_REQ })
      .isIn(["kg"]),

    check("DPYUsed")
      .if(check("DPYUsed").notEmpty())
      .trim()
      .notEmpty()
      .withMessage({ en: enLang.DPYUSED_REQ, es: esLang.DPYUSED_REQ }),
  ];
};
