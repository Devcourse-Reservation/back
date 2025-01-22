"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("flights", "class");
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("flights", "class", {
      type: Sequelize.ENUM("economy", "business", "first"),
      allowNull: false,
    });
  },
};
