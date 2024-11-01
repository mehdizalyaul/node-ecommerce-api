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
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Create users
      const users = Array.from({ length: 10 }).map(() => ({
        name: faker.person.firstName(),
        password: faker.internet.password(),
        email: faker.internet.email(),
      }));
      const createdUsers = await User.bulkCreate(users, { transaction });

      // Create categories
      const categories = Array.from({ length: 8 }).map(() => ({
        name: faker.commerce.department(),
      }));
      const createdCategories = await Category.bulkCreate(categories, {
        transaction,
      });

      // Create products
      const products = Array.from({ length: 20 }).map(() => ({
        images: Array.from({ length: 3 }).map(() => faker.image.avatar()),
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price({ min: 100, max: 500 })),
        stock: faker.number.int({ max: 100 }),
        categoryId: faker.helpers.arrayElement(createdCategories).id,
      }));
      const createdProducts = await Product.bulkCreate(products, {
        transaction,
      });

      // Create cart items
      const cartItems = Array.from({ length: 12 }).map(() => ({
        userId: faker.helpers.arrayElement(createdUsers).id,
        productId: faker.helpers.arrayElement(createdProducts).id,
        quantity: faker.number.int({ max: 50 }),
      }));
      const createdCartItems = await CartItem.bulkCreate(cartItems, {
        transaction,
        ignoreDuplicates: true,
      });

      // Fetch products beforehand
      const productsList = await Product.findAll();
      const productsMap = productsList.reduce((map, product) => {
        map[product.id] = product;
        return map;
      }, {});

      for (const user of createdUsers) {
        const userCarts = createdCartItems.filter(
          (cart) => cart.userId === user.id
        );
        if (userCarts.length === 0) continue;

        let userTotalPrice = 0;
        const orderItems = userCarts
          .map((userCart) => {
            const product = productsMap[userCart.productId];
            if (product) {
              const totalProductPrice = product.price * userCart.quantity;
              userTotalPrice += totalProductPrice;
              return {
                productId: product.id,
                quantity: userCart.quantity,
                totalPrice: totalProductPrice,
              };
            }
          })
          .filter((item) => item !== undefined);

        const createdOrder = await Order.create(
          {
            userId: user.id,
            totalAmount: userTotalPrice,
            address: faker.location.street(),
            paymentMethod: faker.finance.transactionType(),
          },
          { transaction }
        );
        await Promise.all(
          orderItems.map((item) =>
            OrderItem.create(
              {
                orderId: createdOrder.id,
                productId: item.productId,
                quantity: item.quantity,
                totalPrice: item.totalPrice,
              },
              { transaction }
            )
          )
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error("Transaction rolled back due to error:", error);
    }
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
