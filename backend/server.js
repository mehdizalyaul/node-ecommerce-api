const sequelize = require("./config/database.js");
const { User, Product, Order, OrderItem, CartItem } = require("./models");
const express = require("express");
const productRoutes = require("./routes/product.js");
const userRoutes = require("./routes/user.js");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Parse incoming JSON data
app.use(express.json());

// Parse URL-encoded data from forms
app.use(express.urlencoded({ extended: true }));

app.use("/api", userRoutes);

app.use("/api", productRoutes);

app.get("/", (req, res) => {
  res.send("Hello world");
});

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
