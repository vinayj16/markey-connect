-- Database initialization script for MarketConnect

-- Drop tables if they exist
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS vendors;

-- Vendors table
CREATE TABLE vendors (
  vendor_id SERIAL PRIMARY KEY,
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100) NOT NULL,
  business_address TEXT NOT NULL,
  registration_number VARCHAR(100) NOT NULL,
  contact_person_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  logo_url TEXT,
  qr_code_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE customers (
  customer_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  auth_provider VARCHAR(50) DEFAULT 'email', -- email, google, facebook, twitter
  auth_provider_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
  product_id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(100) NOT NULL,
  image_url TEXT,
  available_online BOOLEAN DEFAULT TRUE,
  available_in_store BOOLEAN DEFAULT TRUE,
  views INTEGER DEFAULT 0,
  discount_price DECIMAL(10,2),
  discount_start_date TIMESTAMP,
  discount_end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart items table
CREATE TABLE cart_items (
  cart_item_id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address TEXT NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
  order_type VARCHAR(20) NOT NULL DEFAULT 'online', -- online, in_store
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
  order_item_id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_cart_items_customer_id ON cart_items(customer_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
