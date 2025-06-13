const { check } = require("express-validator");
const { checkAnimalNo } = require("./custom");
const { AnimalFeed } = require(rootPath + "/helpers/controller");
const { respError: enLang } = require("./../../helpers/response/en");
const { respError: esLang } = require("./../../helpers/response/es");

// custom validation
const checkFeedNumber = async (feedNumber, { req }) => {
  const status = await AnimalFeed.getDetails({ feedNumber }, null, false);
  if (status === null) {
    const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
    const { respError } = require(rootPath + "/helpers/response/" + language);
    throw new Error(respError.INVALID_FEED_NUMBER);
  }
};
// rules
const feedUom = ["kg", "gramms", "kg/day"];

exports.post = () => {
  return [
    check("animalNumber")
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.EVENT_HEALTH_REC_ANIMAL_NUMBER,
        es: esLang.EVENT_HEALTH_REC_ANIMAL_NUMBER
      })
      .bail()
      .escape()
      .custom(checkAnimalNo),
    check("feeds")
      .isArray({ min: 1 })
      .withMessage({
        en: enLang.EVENT_HEALTH_REC_ANIMAL_ARRAY,
        es: esLang.EVENT_HEALTH_REC_ANIMAL_ARRAY
      }),
    check("feeds.*.feedName")
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.FEED_NAME_REQ,
        es: esLang.FEED_NAME_REQ
      })
      .isString()
      .escape(),
    check("feeds.*.note")
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.NOTE_REQ,
        es: esLang.NOTE_REQ
      })
      .escape(),
    check("feeds.*.feedQty")
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.FEED_QTY_REQ,
        es: esLang.FEED_QTY_REQ
      })
      .isFloat()
      .escape(),
    check("feeds.*.feedUom")
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.FEED_UOM_REQ,
        es: esLang.FEED_UOM_REQ
      })
      .isIn(feedUom)
      .escape(),
  ];
};

exports.put = () => {
  return [
    check("feedNumber")
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.FEED_NUMBER_REQ,
        es: esLang.FEED_NUMBER_REQ
      })
      .bail()
      .escape()
      .custom(checkFeedNumber),
    check("feedName")
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.FEED_NAME_REQ,
        es: esLang.FEED_NAME_REQ
      })
      .escape(),
    check("animalNumber")
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.EVENT_HEALTH_REC_ANIMAL_NUMBER,
        es: esLang.EVENT_HEALTH_REC_ANIMAL_NUMBER
      })
      .bail()
      .escape()
      .custom(checkAnimalNo),
    check("note").trim().notEmpty().withMessage({
      en: enLang.NOTE_REQ,
      es: esLang.NOTE_REQ
    }).escape(),
    check("feedQty")
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.FEED_QTY_REQ,
        es: esLang.FEED_QTY_REQ
      })
      .isFloat()
      .escape(),
    check("feedUom")
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.FEED_UOM_REQ,
        es: esLang.FEED_UOM_REQ
      })
      .isIn(feedUom)
      .escape(),
  ];
};

exports.get = () => {
  return [check("feedNumber").trim().notEmpty().escape()];
};

exports.getOne = () => {
  return [
    check("animalNumber")
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.EVENT_HEALTH_REC_ANIMAL_NUMBER,
        es: esLang.EVENT_HEALTH_REC_ANIMAL_NUMBER
      })
      .bail()
      .escape()
      .custom(checkAnimalNo),
    check("date")
      .trim()
      .notEmpty()
      .withMessage({
        en: enLang.DATE_REQ,
        es: esLang.DATE_REQ
      })
      .bail()
      .isDate({
        format: process.env.ACCEPT_DATE_FORMAT,
      })
      .withMessage({
        en: enLang.EVENT_DATE_FORMAT + process.env.ACCEPT_DATE_FORMAT + " format",
        es: esLang.EVENT_DATE_FORMAT + process.env.ACCEPT_DATE_FORMAT + " format"
      }),
  ];
};
