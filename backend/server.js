require("dotenv").config();
const sequelize = require("./config/database.js");
const {
  User,
  Product,
  Category,
  Order,
  OrderItem,
  CartItem,
} = require("./models");
const express = require("express");

const routes = require("./routes");
const RefreshToken = require("./models/RefreshToken.js");

const app = express();
const port = process.env.PORT;

console.log(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  process.env.DATABASE_HOST
);
// Parse incoming JSON data
app.use(express.json());

// Parse URL-encoded data from forms
app.use(express.urlencoded({ extended: true }));

app.use("/", routes);

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synced successfully");
  })
  .catch((err) => {
    console.error("Error syncing the database:", err);
  });

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
