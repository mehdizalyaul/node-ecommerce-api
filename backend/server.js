const sequelize = require("./config/database.js");
const User = require("./models/User.js");
const Order = require("./models/Order.js");
const Product = require("./models/Product.js");
const OrderItem = require("./models/OrderItem.js");
const CartItem = require("./models/CartItem.js");

// User has many Orders
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

// User has many CartItems
User.hasMany(CartItem, { foreignKey: "userId" });
CartItem.belongsTo(User, { foreignKey: "userId" });

// Order has many OrderItems
Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

// Product has many OrderItems
Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

// Product has many CartItems
Product.hasMany(CartItem, { foreignKey: "productId" });
CartItem.belongsTo(Product, { foreignKey: "productId" });

// Optional: User belongs to many Products through CartItems
User.belongsToMany(Product, {
  through: CartItem,
  foreignKey: "userId",
  otherKey: "productId",
});
Product.belongsToMany(User, {
  through: CartItem,
  foreignKey: "productId",
  otherKey: "userId",
});

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
