const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Flight = require('./Flight');

const Airport = sequelize.define('Airports', {
  airportId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(3),
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
}, {
  tableName: 'airports', 
  timestamps: false,     
});

Airport.associate = (models) => {
  Airport.hasMany(models.Flight, {
    foreignKey: 'departureAirportId',
    as: 'departureFlights',
  });

  Airport.hasMany(models.Flight, {
    foreignKey: 'arrivalAirportId',
    as: 'arrivalFlights',
  });
};

module.exports = Airport;