const { Sequelize, Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database.js");

class User extends Model {}

User.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "password_hash",
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      field: "is_email_verified",
    },
    address: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = User;
