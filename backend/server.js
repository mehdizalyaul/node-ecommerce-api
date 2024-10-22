const sequelize = require("./config/database.js");
const User = require("./models/User.js");
const Order = require("./models/Order.js");
const Product = require("./models/Product.js");
const OrderItem = require("./models/OrderItem.js");
const CartItem = require("./models/CartItem.js");

// User
User.hasMany(Order, { foreignKey: "userId", onDelete: "CASCADE" });
User.hasMany(CartItem, { foreignKey: "userId", onDelete: "CASCADE" });

// Product
Product.belongsToMany(Order, {
  through: OrderItem,
  foreignKey: "productId",
  onDelete: "CASCADE",
});
Product.hasMany(CartItem, { foreignKey: "productId", onDelete: "CASCADE" });

// CartItem
CartItem.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
CartItem.belongsTo(Product, { foreignKey: "productId", onDelete: "CASCADE" });

// Order
Order.belongsToMany(Product, {
  through: OrderItem,
  foreignKey: "orderId",
  onDelete: "CASCADE",
});
Order.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });

sequelize
  .sync({ force: true })
  .then(() => {
    console.log("Database synced successfully");
  })
  .catch((err) => {
    console.error("Error syncing the database:", err);
  });

module.exports = {
  User,
  Order,
  Product,
  sequelize,
};
