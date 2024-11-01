"use strict";

const { faker } = require("@faker-js/faker");
const {
  User,
  Category,
  Product,
  CartItem,
  Order,
  OrderItem,
} = require("../models");

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create users
    const users = Array.from({ length: 10 }).map(() => ({
      name: faker.internet.username(),
      password: faker.internet.password(),
      email: faker.internet.email(),
    }));
    const createdUsers = await User.bulkCreate(users);

    // Create categories
    const categories = Array.from({ length: 8 }).map(() => ({
      name: faker.commerce.department(),
    }));
    const createdCategories = await Category.bulkCreate(categories);

    // Create products and associate with categories
    const products = Array.from({ length: 20 }).map(() => ({
      images: Array.from({ length: 3 }).map(() => faker.image.avatar()),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price({ min: 100, max: 500 })),
      stock: faker.number.int({ max: 100 }),
      categoryId: faker.helpers.arrayElement(createdCategories).id,
    }));
    const createdProducts = await Product.bulkCreate(products);

    // Create cart items
    const cartItems = Array.from({ length: 12 }).map(() => ({
      userId: faker.helpers.arrayElement(createdUsers).id,
      productId: faker.helpers.arrayElement(createdProducts).id,
      quantity: faker.number.int({ max: 50 }),
    }));

    const createdCartItems = await CartItem.bulkCreate(cartItems);

    // Create orders associated with users
    const orders = Array.from({ length: 10 }).map(() => {
      return {
        userId: faker.helpers.arrayElement(createdUsers).id,
        address: faker.location.street(),
        paymentMethod: faker.finance.transactionType(),
      };
    });
    const createdOrders = await Order.bulkCreate(orders);

    // Create order items associated with orders and products
    const orderItems = Array.from({ length: 25 }).map(() => {
      const selectedProduct = faker.helpers.arrayElement(createdProducts);
      const quantity = faker.number.int({ max: 5, min: 1 });
      return {
        orderId: faker.helpers.arrayElement(createdOrders).id,
        productId: selectedProduct.id,
        quantity,
        price: selectedProduct.price * quantity,
      };
    });
    await OrderItem.bulkCreate(orderItems);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("OrderItems", null, {});
    await queryInterface.bulkDelete("Orders", null, {});
    await queryInterface.bulkDelete("CartItems", null, {});
    await queryInterface.bulkDelete("Products", null, {});
    await queryInterface.bulkDelete("Categories", null, {});
    await queryInterface.bulkDelete("Users", null, {});
  },
};
