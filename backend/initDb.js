const fs = require('fs');
const path = require('path');
const db = require('./config/db');
require('dotenv').config();

async function initializeDatabase() {
  try {
    console.log('Reading SQL file...');
    const sqlPath = path.join(__dirname, 'models', 'database.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Connecting to database...');
    await db.connectDB();
    console.log('Executing SQL script...');
    await db.query(sql);

    // Insert sample vendor
    const vendorResult = await db.query(
      `INSERT INTO vendors (business_name, business_type, business_address, registration_number, 
        contact_person_name, email, phone, username, password) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING vendor_id`,
      ['Sample Store', 'Retail', '123 Main St', 'REG123', 
       'John Doe', 'sample@store.com', '1234567890', 'samplestore', 'password123']
    );
    const vendorId = vendorResult.rows[0].vendor_id;

    // Insert sample products
    const products = [
      {
        name: 'Premium Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 2999,
        stock_quantity: 50,
        category: 'Electronics',
        views: 120,
        discount_price: 2499,
        discount_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      {
        name: 'Smart Watch',
        description: 'Feature-rich smartwatch with health monitoring',
        price: 1999,
        stock_quantity: 75,
        category: 'Electronics',
        views: 85,
        discount_price: 1799,
        discount_end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
      },
      {
        name: 'Wireless Charger',
        description: 'Fast wireless charging pad compatible with all devices',
        price: 899,
        stock_quantity: 100,
        category: 'Electronics',
        views: 65,
        discount_price: 799,
        discount_end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days from now
      },
      {
        name: 'Bluetooth Speaker',
        description: 'Portable Bluetooth speaker with deep bass and long battery life',
        price: 1499,
        stock_quantity: 60,
        category: 'Electronics',
        views: 45,
        discount_price: 1299,
        discount_end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      }
    ];

    for (const product of products) {
      await db.query(
        `INSERT INTO products (vendor_id, name, description, price, stock_quantity, category, 
          views, discount_price, discount_end_date) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [vendorId, product.name, product.description, product.price, product.stock_quantity,
         product.category, product.views, product.discount_price, product.discount_end_date]
      );
    }

    console.log('Database initialization and sample data insertion completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
