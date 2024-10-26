const User = require("./User");
const Product = require("./Product");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const CartItem = require("./CartItem");
const RefreshToken = require("./RefreshToken");

User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

User.hasMany(CartItem, { foreignKey: "userId", onDelete: "CASCADE" });
CartItem.belongsTo(User, { foreignKey: "userId" });

Order.hasMany(OrderItem, { foreignKey: "orderId", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

Product.hasMany(CartItem, { foreignKey: "productId", onDelete: "SET NULL" });
CartItem.belongsTo(Product, { foreignKey: "productId" });

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

User.hasMany(RefreshToken, { foreignKey: "userId", onDelete: "CASCADE" });
RefreshToken.belongsTo(User, { foreignKey: "userId" });

module.exports = {
  User,
  Product,
  Order,
  OrderItem,
  CartItem,
};
