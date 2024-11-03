"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "verify_email_token", {
      type: Sequelize.STRING,
      allowNull: true,
      field: "verify_email_token",
    });

    await queryInterface.addColumn("users", "verify_email_token_expire", {
      type: Sequelize.DATE,
      allowNull: true,
      field: "verify_email_token_expire",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "verify_email_token");
    await queryInterface.removeColumn("users", "verify_email_token_expire");
  },
};
