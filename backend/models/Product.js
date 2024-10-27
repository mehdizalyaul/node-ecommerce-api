const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database.js");

class Product extends Model {}

Product.init(
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
        notEmpty: true,
        notNull: {
          msg: "Please enter the name of product",
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        notNull: {
          msg: "Please enter product description",
        },
      },
    },
    price: {
      type: DataTypes.FLOAT.UNSIGNED,
      allowNull: false,
      validate: {
        isFloat: true,
        min: 0.01,
        notEmpty: true,
        notNull: {
          msg: "Please enter product price",
        },
      },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
        isInt: true,
        notNull: {
          msg: "Please enter product stock",
        },
      },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
        notNull: {
          msg: "Please enter product category",
        },
      },
      references: {
        model: "categories",
        key: "id",
      },
      field: "category_id",
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      get() {
        const rawImages = this.getDataValue("images");
        if (!rawImages) return null;

        try {
          const parsedImages =
            typeof rawImages === "string" ? JSON.parse(rawImages) : rawImages;
          return parsedImages.map((img) => `${process.env.IMAGE_URL}${img}`);
        } catch (error) {
          console.error("Error parsing images:", error);
          return rawImages; // Return raw if parsing fails
        }
      },
    },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Product;
