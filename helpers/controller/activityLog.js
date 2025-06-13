const moment = require("moment");
const _ = require("lodash");
const db = require(rootPath + "/models");
const { ACTION } = require(rootPath + "/helpers/constant");

/**
 * @description Logs a new user activity in the system
 * @param {object} req - Express request object containing user and activity data
 * @param {object|null} transaction - Optional Sequelize transaction
 * @returns {Promise<object>} Created activity log entry
 */
exports.create = async (req, transaction = null) => {
  const { userNumber: performedById, userRole, userDept } = req.user;
  let { performedOnId, type, action, meta = {}, module = null } = req.activity;

  // Determine HTTP method and set accessType accordingly
  let accessType;
  switch (req.method) {
    case "POST": accessType = "create"; break;
    case "PUT": accessType = "update"; break;
    case "GET": accessType = "read"; break;
    case "DELETE": accessType = "delete"; break;
  }

  // Capture basic metadata from the request
  const location = { clientIP: req.clientIp };
  meta = {
    ...meta,
    location,
    accessMethod: req.method,
    url: {
      originalUrl: req.originalUrl,
      baseUrl: req.baseUrl,
      path: req.path,
      protocol: req.protocol,
      hostname: req.hostname,
    },
    user: { ...req?.user },
  };

  // Check for the latest activity for the same type and action
  const lastPerformedBy = await db.ActivityLog.findOne({
    where: { performedOnId, action, type },
    order: [["id", "DESC"]],
  });

  // Auto-detect module if not explicitly passed
  if (module === null) {
    const slug = req.baseUrl.split("/").splice(0, 3).join("/");
    module = await db.NAGRCModule.findOne({
      attributes: ["id", "slug", "type", "module"],
      where: { slug, type: "module" },
      raw: true,
    });
    module = module?.module;
  }

  // Prepare log entry data
  const set = {
    performedById,
    performedOnId,
    type,
    meta,
    module,
    ...(_.isEmpty(userRole?.name) ? null : { role: userRole.name }),
    ...(_.isEmpty(userDept?.name) ? null : { department: userDept.name }),
    ...(_.isEmpty(accessType) ? null : { accessType }),
    ...(_.isEmpty(action)
      ? null
      : {
          action: ACTION[action]["action"],
          title: ACTION[action]["activity"],
        }),
    ...(_.isEmpty(lastPerformedBy)
      ? null
      : {
          lastPerformedById: lastPerformedBy.performedById,
          lastUpdatedAt: lastPerformedBy.createdAt,
        }),
  };

  // Save activity to database
  const result = await db.ActivityLog.create(set, { transaction });
  return await result.toJSON();
};

/**
 * @description Get all activities related to animals
 * @param {object} req - Express request object
 * @param {object|null} where - Optional Sequelize where clause
 * @param {Array|null} attributes - Optional Sequelize attributes list
 * @returns {Promise<object>} List of activities
 */
exports.animals = async (req, where = null, attributes = null) => {
  let { page = 1, limit = 1000, col = "id", desc = "true" } = req.query;
  limit = parseInt(limit);
  where = { ...where, type: "animal" };

  let { count, rows: activities } = await db.ActivityLog.findAndCountAll({
    include: [{ model: db.User, as: "user", attributes: [] }],
    attributes: attributes ?? [
      "createdAt",
      [db.sequelize.literal("user.name"), "operatorName"],
      ["title", "activity"],
      "status",
    ],
    where,
    offset: (page - 1) * limit,
    limit: limit,
    order: [[col, desc == "false" ? "ASC" : "DESC"]],
  });

  // Format timestamps to user-readable format
  if (!_.isEmpty(activities)) {
    activities = await Promise.all(
      activities.map(async (activity) => {
        activity = await activity.toJSON();
        const { createdAt, updatedAt } = activity;
        return {
          ...activity,
          ...(moment(createdAt, process.env.ACCEPT_DATE_FORMAT, true).isValid()
            ? {
                createdAt: moment(createdAt).format(
                  process.env.ACCEPT_DATE_FORMAT
                ),
              }
            : null),
          ...(moment(updatedAt, process.env.ACCEPT_DATE_FORMAT, true).isValid()
            ? {
                updatedAt: moment(updatedAt).format(
                  process.env.ACCEPT_DATE_FORMAT
                ),
              }
            : null),
        };
      })
    );
  }

  return {
    num_rows: activities.length,
    total_rows: count,
    rows: activities,
  };
};

/**
 * @description Get all activity logs with optional filters
 * @param {object} req - Express request object
 * @param {object|null} where - Optional Sequelize where clause
 * @param {Array|null} attributes - Optional Sequelize attributes list
 * @returns {Promise<object>} List of all activity logs
 */
exports.listAll = async (req, where = null, attributes = null) => {
  let { page = 1, limit = 1000, col = "id", desc = "true" } = req.query;
  limit = parseInt(limit);
  where = { ...where };

  let { count, rows } = await db.ActivityLog.findAndCountAll({
    include: [{ model: db.User, as: "user", attributes: [] }],
    attributes: attributes ?? [
      [db.sequelize.literal("user.name"), "userName"],
      "type",
      "action",
      "status",
      "module",
      "title",
      "lastUpdatedAt",
      "department",
      "role",
      "meta",
      "accessType",
      "createdAt",
    ],
    where,
    offset: (page - 1) * limit,
    limit: limit,
    order: [[col, desc == "false" ? "ASC" : "DESC"]],
  });

  // Format createdAt timestamp
  if (!_.isEmpty(rows)) {
    rows = await Promise.all(
      rows.map(async (row) => {
        row = await row.toJSON();
        const { createdAt } = row;
        return {
          ...row,
          ...(moment(createdAt, process.env.DB_DATE, true).isValid()
            ? { createdAt: moment(createdAt).format(process.env.DB_DATE) }
            : null),
        };
      })
    );
  }

  return {
    num_rows: rows.length,
    total_rows: count,
    rows: rows,
  };
};

/**
 * @description Get activity log details by ID
 * @param {object} req - Express request object
 * @param {object|null} where - Optional Sequelize where clause
 * @param {Array|null} attributes - Optional Sequelize attributes list
 * @returns {Promise<object>} Single activity log record
 */
exports.getDetailsById = async (req, where = null, attributes = null) => {
  where = { ...where };

  let activityLogDetail = await db.ActivityLog.findOne({
    include: [{ model: db.User, as: "user", attributes: [] }],
    where,
  });

  activityLogDetail = activityLogDetail.toJSON();

  const { createdAt, updatedAt } = activityLogDetail;
  activityLogDetail = {
    ...activityLogDetail,
    ...(moment(createdAt, process.env.DB_DATE, true).isValid()
      ? { createdAt: moment(createdAt).format(process.env.DB_DATE) }
      : null),
    ...(moment(updatedAt, process.env.DB_DATE, true).isValid()
      ? { updatedAt: moment(updatedAt).format(process.env.DB_DATE) }
      : null),
  };

  // Parse meta JSON string to object
  activityLogDetail.meta = JSON.parse(activityLogDetail.meta);

  return {
    rows: activityLogDetail,
  };
};
