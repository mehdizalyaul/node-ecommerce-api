const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database.js");

class Order extends Model {}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
      references: {
        model: "users",
        key: "id",
      },
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    // TODO: let's make it enum for the payment method, "Cash on Delivery" or "Credit Card"
    // TODO: let's add a new field called paymentDetails to store the payment details like the credit card number
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "payment_method",
      validate: {
        notEmpty: true,
      },
    },
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: "total_amount",
      validate: {
        isFloat: true,
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM(
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled"
      ),
      defaultValue: "Pending",
      validate: {
        isIn: [["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]],
      },
    },
  },
  {
    sequelize,
    modelName: "Order",
    tableName: "orders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Order;
