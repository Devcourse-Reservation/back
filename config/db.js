const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/.env" });

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT,
    logging: false,
  },
);

module.exports = sequelize;
