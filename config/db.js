const { Sequelize } = require("sequelize");
require("dotenv").config();


const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT,
    logging: false,
    define: {
      timestamps: true, // 기본적으로 createdAt과 updatedAt 추가
      underscored: true, // snake_case로 필드 이름 설정
    },
  },
);

module.exports = sequelize;
