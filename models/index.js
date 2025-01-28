const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Airports = require("./airports")(sequelize, DataTypes);
db.Flights = require("./flights")(sequelize, DataTypes);
db.Payments = require("./payments")(sequelize, DataTypes);
db.Seats = require("./seats")(sequelize, DataTypes);
db.Tickets = require("./tickets")(sequelize, DataTypes);
db.Users = require("./users")(sequelize, DataTypes);

// 관계 설정
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db); // associate 메서드가 존재하는 경우만 실행
  }
});

module.exports = db;
