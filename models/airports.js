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
      tableName: "airports",
      //timestamps: false,
    }
  );

  Airports.associate = (models) => {
    Airports.hasMany(models.Flights, {
      foreignKey: "departure_airport_id",
      as: "departureFlights",
    });

    Airports.hasMany(models.Flights, {
      foreignKey: "arrival_airport_id",
      as: "arrivalFlights",
    });
  };
  return Airports;
};
