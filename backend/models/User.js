const { Sequelize, Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database.js");

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 100],
        notEmpty: true,
        notNull: {
          msg: "Please enter your name",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "password_hash",
      validate: {
        notEmpty: true,
        notNull: {
          msg: "Please enter your password",
        },
      },
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      field: "is_email_verified",
      defaultValue: false,
      validate: {
        notEmpty: true,
      },
    },
    address: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: true,
      },
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "reset_token",
    },
    resetTokenExpire: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "reset_token_expire",
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
