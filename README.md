# MarketConnect

MarketConnect is an e-commerce platform that connects vendors and customers, providing a seamless shopping experience.

## Features

- **Vendor Management**: Register, login, and manage vendor profiles
- **Customer Management**: Register, login, and manage customer profiles
- **Product Management**: Add, update, and delete products
- **Cart Management**: Add products to cart, update quantities, and checkout
- **Order Management**: Place orders, track order status, and view order history
- **Category Browsing**: Browse products by categories

## Tech Stack

- **Frontend**: React.js, CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd marketconnect
   ```

2. Install dependencies for the backend:
   ```
   npm install
   ```

3. Install dependencies for the frontend:
   ```
   cd frontend
   npm install
   cd ..
   ```

4. Create a PostgreSQL database:
   ```
   createdb vendor_db
   ```

5. Configure environment variables:
   - Create a `.env` file in the root directory
   - Create a `.env` file in the `backend` directory
   - Create a `.env` file in the `frontend` directory
   
   Use the provided sample `.env` files as templates.

6. Initialize the database with schema and sample data:
   ```
   npm run init:db
   ```

## Running the Application

1. Start the backend server:
   ```
   npm run server
   ```

2. Start the frontend development server:
   ```
   npm run client
   ```

3. Run both frontend and backend concurrently:
   ```
   npm run dev:full
   ```

## API Endpoints

### Vendors
- `POST /api/vendors/register` - Register a new vendor
- `POST /api/vendors/login` - Login as a vendor
- `GET /api/vendors/profile` - Get vendor profile
- `PUT /api/vendors/profile` - Update vendor profile
- `GET /api/vendors/products` - Get vendor products
- `GET /api/vendors/orders` - Get vendor orders

### Customers
- `POST /api/customers/register` - Register a new customer
- `POST /api/customers/login` - Login as a customer
- `GET /api/customers/profile` - Get customer profile
- `PUT /api/customers/profile` - Update customer profile
- `GET /api/customers/orders` - Get customer orders
- `GET /api/customers/preferences` - Get customer preferences
- `PUT /api/customers/preferences` - Update customer preferences

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Add a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove item from cart

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create a new order
- `PUT /api/orders/:id/status` - Update order status

## License

This project is licensed under the ISC License.
