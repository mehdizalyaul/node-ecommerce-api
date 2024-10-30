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
const app = express();

const logger = require("./utils/logger.js");
const morgan = require("morgan");

const port = process.env.PORT;

// Parse incoming JSON data
app.use(express.json());

// Parse URL-encoded data from forms
app.use(express.urlencoded({ extended: true }));

const morganFormat = ":method :url :status :response-time ms";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

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
