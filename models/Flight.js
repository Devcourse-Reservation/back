const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Airport = require('./Airport');

const Flight = sequelize.define('Flights', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  flightNumber: {
    type: DataTypes.STRING,
    field: 'flight_number', 
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
    type: DataTypes.INTEGER,
    field: 'departure_airport_id',
    allowNull: false,
  },
  arrivalAirportId: {
    type: DataTypes.INTEGER,
    field: 'arrival_airport_id',
    allowNull: false,
  },
  departureTime: {
    type: DataTypes.DATE,
    field: 'departure_time',
    allowNull: false,
  },
  arrivalTime: {
    type: DataTypes.DATE,
    field: 'arrival_time',
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at', 
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at', 
  },
},
{
  tableName: 'flights', 
  timestamps: false, 
})

Flight.associate = (models) => {
  Flight.belongsTo(models.Airport, {
    foreignKey: 'departureAirportId',
    as: 'departureAirport',
  });

  Flight.belongsTo(models.Airport, {
    foreignKey: 'arrivalAirportId',
    as: 'arrivalAirport',
  });
};

module.exports = Flight;