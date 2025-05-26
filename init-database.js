// Script to initialize the database with schema and sample data
require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting database initialization...');

// Run the backend/initDb.js script
const initDbPath = path.join(__dirname, 'backend', 'initDb.js');
const child = spawn('node', [initDbPath], { stdio: 'inherit' });

child.on('close', (code) => {
  if (code === 0) {
    console.log('Database initialization completed successfully!');
  } else {
    console.error(`Database initialization failed with code ${code}`);
  }
});