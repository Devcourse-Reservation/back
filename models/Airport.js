const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Flight = require('./Flight');

const Airport = sequelize.define('Airport', {
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

// Airport.js
Airport.associate = (models) => {
  // 출발 공항에서 출발하는 항공편
  Airport.hasMany(models.Flight, {
    foreignKey: 'departureAirportId', // 외래 키
    as: 'departureFlights',           // 관계 이름
  });

  // 도착 공항으로 도착하는 항공편
  Airport.hasMany(models.Flight, {
    foreignKey: 'arrivalAirportId', // 외래 키
    as: 'arrivalFlights',           // 관계 이름
  });
};

module.exports = Airport;