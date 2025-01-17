const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Tickets = require("./tickets")(sequelize, DataTypes);
db.Seats = require("./seats")(sequelize, DataTypes);
db.Users = require("./users")(sequelize, DataTypes);
db.Flights = require("./flights")(sequelize, DataTypes);
db.Airports = require("./airports")(sequelize, DataTypes);
db.Payments = require("./payments")(sequelize, DataTypes);

db.Tickets.associate(db);
db.Flights.associate(db);
db.Airports.associate(db);
db.Payments.associate(db);
db.Seats.associate(db);

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database synced");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

module.exports = db;
