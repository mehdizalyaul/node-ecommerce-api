"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("orders", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: "user_id",
        references: {
          model: "users",
          key: "id",
        },
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "product_id",
      },
      paymentMethod: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "payment_method",
      },
      totalAmount: {
        type: Sequelize.FLOAT,
        allowNull: false,
        field: "total_amount",
      },
      status: {
        type: Sequelize.ENUM(
          "Pending",
          "Processing",
          "Shipped",
          "Delivered",
          "Cancelled"
        ),
        defaultValue: "Pending",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        field: "created_at",
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        field: "updated_at",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("orders");
  },
};
