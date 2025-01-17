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

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database synced");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

module.exports = db;
