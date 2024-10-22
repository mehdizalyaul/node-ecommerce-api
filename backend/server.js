const sequelize = require("./config/database.js");
const {
  User,
  Product,
  Order,
  OrderItem,
  CartItem
} = require("./models");

sequelize
  .sync({ force: true })
  .then(() => {
    console.log("Database synced successfully");
  })
  .catch((err) => {
    console.error("Error syncing the database:", err);
  });