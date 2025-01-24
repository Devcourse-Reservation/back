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
      // createdAt: {
      //   type: DataTypes.DATE,
      //   defaultValue: DataTypes.NOW,
      //   field: "created_at",
      // },
      // updatedAt: {
      //   type: DataTypes.DATE,
      //   defaultValue: DataTypes.NOW,
      //   field: "updated_at",
      // },
    },
    {
      tableName: "flights",
      //timestamps: false,
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
