// const sequelize = require('../config/db'); // db.js 파일 경로
// const { Airport, Flight } = require('./models'); // 모델들 임포트

// // 관계 설정
// Airport.associate({ Flight });
// Flight.associate({ Airport });

// module.exports = { sequelize, Airport, Flight };

const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Flight = require("./Flight")(sequelize, DataTypes);
db.Airport = require("./Airport")(sequelize, DataTypes);

db.Flight.associate(db);
db.Airport.associate(db);

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database synced");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

module.exports = db;