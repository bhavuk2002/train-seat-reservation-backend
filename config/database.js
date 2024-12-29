require("dotenv").config();
const Sequelize = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  host: process.env.DATABASE_HOST,
  dialectOptions: {},
});

module.exports = sequelize;
