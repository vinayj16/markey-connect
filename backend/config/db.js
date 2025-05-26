const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection function
const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log(`PostgreSQL Connected: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    client.release();
    return pool;
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Export both the connection function and query methods
module.exports = {
  connectDB,
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool
};
