const moment = require("moment");
const db = require(rootPath + "/models");
const { notEmpty, getFormattedId } = require(rootPath + "/helpers/general");
const { ACTION } = require(rootPath + "/helpers/constant");

/**
 * @desc Adds an activity log entry for an animal
 * @param {Object} req - Express request object containing user info
 * @param {Object} param1 - Contains animalNumber, action, and data
 * @param {Object} transaction - Sequelize transaction (optional)
 * @returns {Object} - Created activity log without internal ID
 */
exports.addActivityLog = async (
  req,
  { animalNumber, action, data },
  transaction
) => {
  const { userNumber } = req.user;

  // Capture request IP info
  const info = {
    clientIP: req.clientIp,
  };

  // Merge extra data
  data = { ...data, info };

  // Prepare log entry
  let set = {
    animalNumber,
    userNumber,
    action: ACTION[action]["action"],     // e.g., "UPDATE", "CREATE"
    activity: ACTION[action]["activity"], // Human-readable message
    meta: JSON.stringify(data),           // JSON string for metadata
  };

  // Create log in DB with optional transaction
  const activityLog = await db.AnimalActivityLog.create(set, { transaction });

  // Return created log entry without internal ID field
  return { ...(await activityLog.toJSON()), id: undefined };
};

/**
 * @desc Lists all activity logs for animals with optional filters
 * @param {Object} req - Express request object containing query params
 * @param {Array|null} attributes - Sequelize attributes to return (optional)
 * @param {Object|null} where - Sequelize where clause (optional)
 * @returns {Object} - Paginated list of activity logs
 */
exports.listActivityLogs = async (req, attributes = null, where = null) => {
  // Extract pagination and sorting from query parameters
  let { page = 1, limit = 1000, col, desc } = req.query;
  limit = parseInt(limit);

  // Fetch logs with optional filters and joins
  let { count, rows: activities } = await db.AnimalActivityLog.findAndCountAll({
    include: [
      {
        model: db.User,
        as: "user",
        attributes: [], // Just used for alias 'operatorName' via raw query
      },
    ],
    raw: true,
    nest: true,
    attributes: attributes ?? [
      "createdAt",
      [db.sequelize.literal("user.name"), "operatorName"],
      "activity",
      "status",
    ],
    where,
    offset: (page - 1) * limit,
    limit,
    order: [[col ?? "id", desc == "false" ? "ASC" : "DESC"]],
  });

  // Re-format date fields and parse JSON data if present
  if (notEmpty(activities)) {
    activities = activities.map((activity) => {
      const { createdAt, updatedAt, data } = activity;
      return {
        ...activity,

        ...(data !== undefined ? { data: JSON.parse(data) } : null),

        ...(moment(createdAt, process.env.ACCEPT_DATE_FORMAT, true).isValid()
          ? { createdAt: moment(createdAt).format(process.env.ACCEPT_DATE_FORMAT) }
          : null),

        ...(moment(updatedAt, process.env.ACCEPT_DATE_FORMAT, true).isValid()
          ? { updatedAt: moment(updatedAt).format(process.env.ACCEPT_DATE_FORMAT) }
          : null),
      };
    });
  }

  // Return paginated result
  return {
    num_rows: activities.length, // Number of rows returned
    total_rows: count,           // Total matching rows
    rows: activities,            // Activity log entries
  };
};
