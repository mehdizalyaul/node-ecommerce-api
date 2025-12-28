# Node E-commerce API

A REST API for an e-commerce app built with **Node.js**, **Express**, **MySQL**, and **Sequelize**.
It covers the basics: users, authentication, products, carts, and orders. All in one place.

## What’s Included

- User authentication with JWT (login & refresh tokens)
- Email verification and password reset
- Product and category management
- Image uploads for products
- Shopping cart and order creation
- MySQL database with Sequelize ORM
- Basic validation, logging, and error handling

## Getting Started

### Setup

Install dependencies

```bash
npm install
```

Create environment file

```bash
cp .env.example .env
```

Run database migrations

```bash
npm run db:migrate
```

Seed sample data (Optional)

```bash
npm run db:seed
```

Start the server

```bash
npm start
```

The API will be available at:

```
http://localhost:3000/api
```

## Authentication

- Most routes require a valid **access token**
- Send it in the header:

```
Authorization: Bearer <accessToken>
```

* Access tokens can be refreshed using a refresh token

## API Overview

### Auth & Users

- Register, login, logout
- Email verification & resend verification
- Password reset flow
- Get/update/delete users
- Get authenticated user profile

### Categories

* Create product categories

### Products

* Create, update, delete products
* Upload product images
* Get all products or a single product

### Cart (Authenticated)

* Add items to cart
* Update item quantity
* Remove items
* View your cart

### Orders (Authenticated)

* Create an order from cart items
* View your orders
* View order details
* Delete an order

## Response Format

Successful responses usually look like:

```json
{
  "code": 200,
  "data": {}
}
```

Errors look like:

```json
{
  "code": 400,
  "error": {
    "message": "Something went wrong"
  }
}
```

## File Uploads

- Product images are stored locally in the `uploads/` folder
- Image URLs are returned with product data

## Tech Stack

- Node.js / Express, MySQL, Sequelize, JWT, Joi, Multer, Winston, Morgan.
