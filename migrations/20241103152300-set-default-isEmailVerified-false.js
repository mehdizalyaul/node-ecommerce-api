"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      `UPDATE Users SET is_email_verified = false WHERE is_email_verified IS NULL OR is_email_verified = true;`
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      `UPDATE Users SET is_email_verified = true WHERE is_email_verified = false;`
    );
  },
};
