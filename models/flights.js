module.exports = (sequelize, DataTypes) => {
  const Flights = sequelize.define(
    "Flights",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      flight_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      airline: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      departureAirportId: {
        type: DataTypes.BIGINT,
        field: "departure_airport_id",
        allowNull: false,
      },
      arrivalAirportId: {
        type: DataTypes.BIGINT,
        field: "arrival_airport_id",
        allowNull: false,
      },
      departureTime: {
        type: DataTypes.DATE,
        field: "departure_time",
        allowNull: false,
      },
      arrivalTime: {
        type: DataTypes.DATE,
        field: "arrival_time",
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "flights",
      timestamps: false,
    }
  );
  Flights.associate = (models) => {
    Flights.belongsTo(models.Airports, {
      foreignKey: "departure_airport_id",
      as: "departureAirport",
    });

    Flights.belongsTo(models.Airports, {
      foreignKey: "arrival_airport_id",
      as: "arrivalAirport",
    });
    Flights.hasMany(models.Tickets, {
      foreignKey: "flight_id",
      sourceKey: "id",
    });
  };
  return Flights;
};
