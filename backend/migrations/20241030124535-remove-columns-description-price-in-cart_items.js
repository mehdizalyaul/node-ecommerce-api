"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("cart_items", "description");
    await queryInterface.removeColumn("cart_items", "price");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("cart_items", "description", {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.addColumn("cart_items", "price", {
      type: Sequelize.FLOAT.UNSIGNED,
      allowNull: false,
    });
  },
};
