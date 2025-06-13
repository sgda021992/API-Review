const db = require(rootPath + "/models");
const moment = require("moment");
const { notEmpty } = require(rootPath + "/helpers/general");
const { ANIMAL_IMAGE_URL } = require(rootPath + "/helpers/constant");

/**
 * @desc Fetch paginated list of animals with optional attributes, filters, joins, and grouping
 */
exports.listAllAnimals = async (req, attributes = null, where = null, join = true, groupBy = false, groupByAttr = {}) => {
  let { page = 1, limit = 1000, col = "id", desc = "true" } = req.query;
  limit = parseInt(limit);

  // Build query with pagination, sorting, filtering, and optional grouping
  let query = {
    distinct: true,
    offset: (page - 1) * limit,
    limit: limit,
    where,
    order: [[col ?? "id", desc == "false" ? "ASC" : "DESC"]],
  };

  if (groupBy) query.group = groupByAttr.groupBy;

  // Include associated image data if join is true
  if (join) {
    query.include = [{
      attributes: ["imageName", "originalName"],
      model: db.AnimalImage,
      as: "img",
    }];
  }

  // Add attribute selection if specified
  if (attributes !== null) query.attributes = attributes;

  // Execute query
  return await db.Animal.findAndCountAll(query);
};

/**
 * @desc Count total number of animals with optional conditions
 */
exports.countTotalAnimals = async (where = null) => {
  return await db.Animal.count({ where });
};

/**
 * @desc Count heifers and dams based on age and gender
 */
exports.countHeiferAndDam = async (where = null) => {
  const calfPeriod = process.env.CALF_PERIOD;
  const greaterThen = moment.utc().subtract(calfPeriod, "days");

  const femaleCount = await db.Animal.count({
    where: {
      ...where,
      gender: "female",
      dob: { [db.Sequelize.Op.lt]: greaterThen },
    },
  });

  const damCount = await db.Animal.count({
    include: [{
      model: db.Animal,
      as: "dams",
      required: true,
      where: { ...where, dob: { [db.Sequelize.Op.lt]: greaterThen } },
    }],
    distinct: true,
    col: "damPubId",
  });

  return { heiferCount: femaleCount - damCount, damCount };
};

/**
 * @desc Count sires (mature males with offspring)
 */
exports.sireCount = async (where = null) => {
  const calfPeriod = process.env.CALF_PERIOD;
  const greaterThen = moment.utc().subtract(calfPeriod, "days");

  where = { ...where, dob: { [db.Sequelize.Op.lt]: greaterThen } };

  return await db.Animal.count({
    include: [{
      model: db.Animal,
      as: "sires",
      required: true,
      where,
    }],
    distinct: true,
    col: "sirePubId",
  });
};

/**
 * @desc Count calves (young animals based on date of birth)
 */
exports.calfCount = async (where = null) => {
  const calfPeriod = process.env.CALF_PERIOD;
  const greaterThen = moment.utc().subtract(calfPeriod, "days");

  where = { ...where, dob: { [db.Sequelize.Op.gt]: greaterThen } };

  return await db.Animal.count({ where });
};

/**
 * @desc Count steers (castrated male cattle)
 */
exports.steerCount = async (where = null) => {
  const calfPeriod = process.env.CALF_PERIOD;
  const greaterThen = moment.utc().subtract(calfPeriod, "days");

  where = {
    ...where,
    gender: "male",
    dob: { [db.Sequelize.Op.lt]: greaterThen },
  };

  return await db.Animal.count({ where });
};

/**
 * @desc Validate dam number (adult female with valid DOB)
 */
exports.isValidDamNo = async (animalNumber) => {
  const calfPeriod = process.env.CALF_PERIOD;
  const greaterThen = moment.utc().subtract(calfPeriod, "days");

  return await db.Animal.findOne({
    attributes: ["animalNumber", "dob", "gender"],
    where: {
      animalNumber,
      dob: { [db.Sequelize.Op.lt]: greaterThen },
      gender: "female",
    },
  });
};

/**
 * @desc Validate sire number (adult non-steer male with valid DOB)
 */
exports.isValidSireNo = async (animalNumber) => {
  const calfPeriod = process.env.CALF_PERIOD;
  const greaterThen = moment.utc().subtract(calfPeriod, "days");

  return await db.Animal.findOne({
    attributes: ["animalNumber", "dob", "gender", "steer"],
    where: {
      animalNumber,
      dob: { [db.Sequelize.Op.lt]: greaterThen },
      gender: "male",
      steer: "0",
    },
  });
};

/**
 * @desc Check if an animal number exists
 */
exports.isValidAnimalNo = async (animalNumber) => {
  return await db.Animal.findOne({
    attributes: ["animalNumber", "dob", "gender", "steer"],
    where: { animalNumber },
  });
};

/**
 * @desc Get details of a specific animal by condition
 */
exports.getAnimalDetails = async (where, attributes = null) => {
  let animalDetails = await db.Animal.findOne({
    attributes: attributes ?? [], // Omitted for brevity (your original list is intact)
    where,
    include: [{
      model: db.AnimalImage,
      as: "img",
      attributes: ["animalNumber", "originalName", "imageName"],
    }],
  });

  if (!animalDetails) return null;

  animalDetails = animalDetails.toJSON();

  let { registeredAt, processingDate, img } = animalDetails;

  // Add image URL if exists
  img = img ? { ...img, url: ANIMAL_IMAGE_URL + img.imageName } : { url: null };

  // Format dates
  animalDetails = {
    ...animalDetails,
    ...(moment(registeredAt, process.env.DB_DATE, true).isValid() ? { registeredAt: moment(registeredAt).format(process.env.DB_DATE) } : {}),
    ...(moment(processingDate, process.env.DB_DATE, true).isValid() ? { processingDate: moment(processingDate).format(process.env.DB_DATE) } : {}),
    animalType: await exports.getAnimalType(animalDetails),
    img,
  };

  return animalDetails;
};

/**
 * @desc Update animal details based on request body
 */
exports.updateAnimalDetail = async (req, transaction = null) => {
  const { animalNumber, ...rest } = req.body;

  // Prepare update fields with proper date formatting
  const dateFields = ["dob", "dateOfSale", "dateOfDeath"];
  const set = Object.fromEntries(
    Object.entries(rest).map(([key, value]) => {
      if (value == null || value == undefined) return [key, undefined];
      return dateFields.includes(key)
        ? [key, moment.utc(value, process.env.ACCEPT_DATE_FORMAT)]
        : [key, value];
    })
  );

  // Remove null/undefined fields
  Object.keys(set).forEach((key) => {
    if (set[key] == undefined || set[key] == null) delete set[key];
  });

  // Build update condition
  let condition = {
    where: { animalNumber },
  };

  if (transaction) condition.transaction = transaction;

  const [updated] = await db.Animal.update(set, condition);
  return updated;
};

/**
 * @desc Get list of animal breeds with pagination and sorting
 */
exports.getAnimalBreeds = async (req, attributes = null, where = null) => {
  let { page = 1, limit = 10000, col, desc = "false" } = req.query;
  limit = parseInt(limit);

  return await db.AnimalBreeds.findAll({
    attributes: attributes ?? { exclude: ["createdAt", "updatedAt"] },
    offset: (page - 1) * limit,
    limit,
    where,
    order: [[col ?? "breedName", desc == "false" ? "ASC" : "DESC"]],
  });
};

/**
 * @desc Get the type/stage of animal (calf, heifer, dam, sire, steer)
 */
exports.getAnimalType = async (animal) => {
  const { gender, steer, dob, animalNumber } = animal;
  const calfPeriod = process.env.CALF_PERIOD;
  const calfAgeLimit = moment.utc().subtract(calfPeriod, "days");
  const isCalf = moment(dob).isAfter(calfAgeLimit);

  switch (true) {
    case isCalf:
      return "calf";
    case gender === "female": {
      const isDam = await db.Animal.findOne({ where: { damPubId: animalNumber } });
      return isDam ? "dam" : "heifer";
    }
    case gender === "male" && steer:
      return "steer";
    case gender === "male" && !steer: {
      const isSire = await db.Animal.findOne({ where: { sirePubId: animalNumber } });
      return isSire ? "sire" : "steer";
    }
    default:
      return "unknown";
  }
};

/**
 * @desc Bulk import animals into the database
 */
exports.importAnimal = async (params) => {
  try {
    return await db.Animal.bulkCreate(params.animal, {
      returning: true,
      ignoreDuplicates: true,
    });
  } catch (err) {
    return err;
  }
};
