require("dotenv").config();
module.exports = {
  development: {
    username: process.env.LOCAL_USERNAME,
    password: process.env.LOCAL_PASSWORD,
    database: process.env.LOCAL_DB,
    host: process.env.LOCAL_HOST,
    dialect: "mysql",
    pool: {
      maxConnections: process.env.MAX_DB_CONNECTION,
      minConnections: process.env.MIN_DB_CONNECTION,
    },
  },
  staging: {
    username: process.env.LIVE_USERNAME,
    password: process.env.LIVE_PASSWORD,
    database: process.env.LIVE_DB,
    host: process.env.LIVE_HOST,
    dialect: "mysql",
    pool: {
      maxConnections: process.env.MAX_DB_CONNECTION,
      minConnections: process.env.MIN_DB_CONNECTION,
    },
  },
  production: {
    username: process.env.LIVE_USERNAME,
    password: process.env.LIVE_PASSWORD,
    database: process.env.LIVE_DB,
    host: process.env.LIVE_HOST,
    dialect: "mysql",
    pool: {
      maxConnections: process.env.MAX_DB_CONNECTION,
      minConnections: process.env.MIN_DB_CONNECTION,
    },
  },
};
