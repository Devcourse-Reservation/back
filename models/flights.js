module.exports = (sequelize, DataTypes) => {
  const Flights = sequelize.define(
    "Flights",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      flightName: {
        type: DataTypes.STRING,
        field: "flight_name",
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
      departure_airport_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      arrival_airport_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      departure_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      arrival_time: {
        type: DataTypes.DATE,
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
  };
  return Flights;
};
