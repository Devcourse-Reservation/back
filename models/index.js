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

// db.Airport.associate(db);
// db.Flights.associate(db);
// db.Payments.associate(db);
// db.Seats.associate(db);
// db.Tickets.associate(db);
// db.Users.associate(db);

// sequelize
//   .sync({ force: false })
//   .then(() => {
//     console.log("Database synced");
//   })
//   .catch((error) => {
//     console.error("Error syncing database:", error);
//   });

// 관계 설정
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db); // associate 메서드가 존재하는 경우만 실행
  }
});

module.exports = db;
