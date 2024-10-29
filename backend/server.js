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

const CustomError = require("./utils/CustomError.js");
const globalErrorHandler = require("./utils/globalErrorHandler.js");

const app = express();
const port = process.env.PORT || 3000;

// Parse incoming JSON data
app.use(express.json());

// Parse URL-encoded data from forms
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.all("*", (req, res, next) => {
  const err = new CustomError(
    `Can't find ${req.originalUrl} on the server!`,
    404
  );
  next(err);
});

app.use(globalErrorHandler);

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

function wraper(controller) {
  return async function (req, res, next) {
    try {
      controller(req, res);
    } catch (error) {
      const err = new CustomError(
        `Can't find ${req.originalUrl} on the server!`,
        404
      );
      next(err);
    }
  };
}
