const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Tickets = require("./tickets")(sequelize, DataTypes);
db.Seats = require("./seats")(sequelize, DataTypes);
db.Payments = require("./payments")(sequelize, DataTypes);
db.Flight = require("./Flight");
db.Airport = require("./Airport");

db.Flight.associate(db);
db.Airport.associate(db);
db.User = require("./user")(sequelize, DataTypes);

db.Tickets.associate(db);
db.Flight.associate(db);
db.Airport.associate(db);
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
