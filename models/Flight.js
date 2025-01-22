const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Airport = require("./Airport");

const Flight = sequelize.define(
  "Flight",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    flightNumber: {
      type: DataTypes.STRING,
      field: "flight_number",
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
    // class: {
    //   type: DataTypes.ENUM('economy', 'business', 'first'),
    //   allowNull: false,
    // },
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
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
  },
  {
    tableName: "flights",
    timestamps: false,
  },
);

// Flight.js
Flight.associate = (models) => {
  // 출발 공항
  Flight.belongsTo(models.Airport, {
    foreignKey: "departureAirportId", // 외래 키
    as: "departureAirport", // 관계 이름
  });

  // 도착 공항
  Flight.belongsTo(models.Airport, {
    foreignKey: "arrivalAirportId", // 외래 키
    as: "arrivalAirport", // 관계 이름
  });
};

module.exports = Flight;
