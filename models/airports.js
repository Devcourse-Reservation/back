module.exports = (sequelize, DataTypes) => {
  const Airports = sequelize.define(
    "Airports",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "airports",
    }
  );

  Airports.associate = (models) => {
    Airports.hasMany(models.Flights, {
      foreignKey: "departureAirportId",
      as: "departureFlights",
    });

    Airports.hasMany(models.Flights, {
      foreignKey: "arrivalAirportId",
      as: "arrivalFlights",
    });
  };
  return Airports;
};