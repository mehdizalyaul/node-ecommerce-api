require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME || "ecom",
    host: process.env.DATABASE_HOST || "127.0.0.1",
    dialect: "mysql",
  },
};
