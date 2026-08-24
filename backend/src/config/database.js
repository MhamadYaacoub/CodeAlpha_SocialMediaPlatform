const { Sequelize } = require("sequelize");
require("dotenv").config();

const sharedOptions = {
  dialect: "postgres",
  logging: false,
  dialectOptions: process.env.DB_SSL === "true"
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : undefined,
};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, sharedOptions)
  : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
      ...sharedOptions,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
    });

module.exports = sequelize;
