const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database.js");

class CartItem extends Model {
    // TODO: create a getter method to calculate the total price of the cart item by multiplying the product price with the quantity
}

CartItem.init(
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
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "product_id",
      references: {
        model: "products",
        key: "id",
      },
    },
    // TODO: The price of the product can be changed, so we should not store the price of the product at the time of adding it to the cart.
    // TODO: So we should remove the price field from the cart item model
    price: {
      type: DataTypes.FLOAT.UNSIGNED,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // TODO: REMOVE THE DESCRIPTION FIELD FROM THE CART ITEM MODEL BECAUSE IT IS NOT NEEDED
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "CartItem",
    tableName: "cart_items",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = CartItem;
