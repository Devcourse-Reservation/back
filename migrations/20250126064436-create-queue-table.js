'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('queue', {
      queueId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      departureLocation: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      arrivalLocation: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      departureDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      returnDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      adultCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      childCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      seatType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending',
      },
      queuePosition: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('queue');
  }
};