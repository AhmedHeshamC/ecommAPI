# E-Commerce API - By Ahmed Hesham

A RESTful API for an e-commerce platform built with Node.js, Express, and MySQL.

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Usage & Examples](#api-usage--examples)
  - [Authentication](#authentication)
  - [Products](#products)
  - [Cart](#cart)
  - [Orders](#orders)
  - [Payments](#payments)
  - [Admin](#admin)
- [Error Handling](#error-handling)
- [Testing](#testing)

---

## Features

- JWT authentication (access & refresh tokens)
- User registration and login
- Product CRUD (admin only for create/update/delete)
- Shopping cart management
- Order creation and tracking
- Stripe payment integration
- Admin dashboard and user management
- Audit logging and security best practices

---

## Prerequisites

- Node.js (v14 or higher)
- MySQL server
- npm or yarn

---

## Installation

1. **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd ecommAPI
    ```

2. **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

---

## Configuration

1. **Environment Variables:**

   Copy `.env.example` to `.env` (or create `.env`) and fill in your values:

    ```
    PORT=3000
    NODE_ENV=development

    DB_HOST=localhost
    DB_USER=root
    DB_PASS=your_mysql_password
    DB_NAME=ecommerce_api_db
    DB_PORT=3306

    JWT_SECRET=your_jwt_secret_key
    JWT_REFRESH_SECRET=your_jwt_refresh_secret
    JWT_EXPIRES_IN=1h
    JWT_REFRESH_EXPIRES_IN=7d

    STRIPE_SECRET_KEY=your_stripe_secret_key
    STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

    CORS_ORIGIN=http://localhost:3000

    RATE_LIMIT_WINDOW_MS=900000
    RATE_LIMIT_MAX=100
    ```

---

## Database Setup

1. **Create the database and tables:**

    ```bash
    mysql -u root -p < database/schema.sql
    ```

    This will create all required tables in `ecommerce_api_db`.

---

## Running the Application

- **Development:**
    ```bash
    npm run dev
    ```
- **Production:**
    ```bash
    npm start
    ```

API will be available at `http://localhost:3000` (or your configured port).

---

## API Usage & Examples

### Authentication

#### Register

- **POST** `/api/v1/auth/register`
- **Body:**
    ```json
    {
      "name": "Alice",
      "email": "alice@example.com",
      "password": "password123"
    }
    ```
- **Response:**
    ```json
    {
      "success": true,
      "token": "<jwt_token>",
      "user": { "id": 1, "name": "Alice", "email": "alice@example.com", "role": "user" }
    }
    ```

#### Login

- **POST** `/api/v1/auth/login`
- **Body:**
    ```json
    {
      "email": "alice@example.com",
      "password": "password123"
    }
    ```
- **Response:** Same as register.

#### Get Current User

- **GET** `/api/v1/auth/me`
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Response:**
    ```json
    {
      "success": true,
      "data": { "id": 1, "name": "Alice", "email": "alice@example.com", "role": "user", "created_at": "..." }
    }
    ```

---

### Products

#### List Products

- **GET** `/api/v1/products?category=shoes&minPrice=10&maxPrice=100&page=1&limit=10`
- **Response:**
    ```json
    {
      "success": true,
      "count": 2,
      "pagination": { "page": 1, "limit": 10 },
      "data": [
        { "id": 1, "name": "Sneaker", "price": 50, ... }
      ]
    }
    ```

#### Get Product

- **GET** `/api/v1/products/1`
- **Response:** Product object.

#### Create Product (Admin only)

- **POST** `/api/v1/products`
- **Headers:** `Authorization: Bearer <admin_jwt_token>`
- **Body:**
    ```json
    {
      "name": "Sneaker",
      "description": "A cool sneaker",
      "price": 50,
      "inventory": 100,
      "category": "shoes"
    }
    ```
- **Response:** Created product.

#### Update Product (Admin only)

- **PUT** `/api/v1/products/1`
- **Headers:** `Authorization: Bearer <admin_jwt_token>`
- **Body:** Partial or full product fields.

#### Delete Product (Admin only)

- **DELETE** `/api/v1/products/1`
- **Headers:** `Authorization: Bearer <admin_jwt_token>`

---

### Cart

#### Get Cart

- **GET** `/api/v1/cart`
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Response:**
    ```json
    {
      "success": true,
      "data": {
        "items": [ { "product_id": 1, "quantity": 2, ... } ],
        "total": 100
      }
    }
    ```

#### Add Item

- **POST** `/api/v1/cart`
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Body:**
    ```json
    { "productId": 1, "quantity": 2 }
    ```

#### Update Item Quantity

- **PATCH** `/api/v1/cart/:itemId`
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Body:**
    ```json
    { "quantity": 3 }
    ```

#### Remove Item

- **DELETE** `/api/v1/cart/:itemId`
- **Headers:** `Authorization: Bearer <jwt_token>`

#### Clear Cart

- **DELETE** `/api/v1/cart`
- **Headers:** `Authorization: Bearer <jwt_token>`

---

### Orders

#### Create Order

- **POST** `/api/v1/orders`
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Body:**
    ```json
    { "paymentIntentId": "<stripe_payment_intent_id>" }
    ```

#### Get My Orders

- **GET** `/api/v1/orders`
- **Headers:** `Authorization: Bearer <jwt_token>`

#### Get Order by ID

- **GET** `/api/v1/orders/:id`
- **Headers:** `Authorization: Bearer <jwt_token>`

#### Admin: Get All Orders

- **GET** `/api/v1/orders/admin/all`
- **Headers:** `Authorization: Bearer <admin_jwt_token>`

#### Admin: Update Order Status

- **PATCH** `/api/v1/orders/:id/status`
- **Headers:** `Authorization: Bearer <admin_jwt_token>`
- **Body:**
    ```json
    { "status": "shipped" }
    ```

---

### Payments

#### Create Payment Intent

- **POST** `/api/v1/payments/create-intent`
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Response:**
    ```json
    {
      "success": true,
      "clientSecret": "<stripe_client_secret>",
      "paymentIntentId": "<stripe_payment_intent_id>",
      "amount": 100
    }
    ```

#### Confirm Payment

- **POST** `/api/v1/payments/confirm`
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Body:**
    ```json
    { "paymentIntentId": "<stripe_payment_intent_id>" }
    ```

#### Get Receipt

- **GET** `/api/v1/payments/receipt/:orderId`
- **Headers:** `Authorization: Bearer <jwt_token>`

#### Stripe Webhook

- **POST** `/api/v1/payments/webhook`
- Used by Stripe to notify payment events (handled internally).

---

### Admin

All admin endpoints require `Authorization: Bearer <admin_jwt_token>`.

#### Get All Users

- **GET** `/api/v1/admin/users`

#### Get User by ID

- **GET** `/api/v1/admin/users/:id`

#### Update User Role

- **PATCH** `/api/v1/admin/users/:id/role`
- **Body:**
    ```json
    { "role": "admin" }
    ```

#### Dashboard Stats

- **GET** `/api/v1/admin/dashboard`

#### Sales Report

- **GET** `/api/v1/admin/sales-report?period=monthly&startDate=2024-01-01&endDate=2024-06-30`

---

## Error Handling

All errors return a JSON response:

```json
{
  "success": false,
  "message": "Error message",
  "error": {}
}
```

---

## Testing

- **Run all tests:**
    ```bash
    npm test
    ```

---

## License

MIT
