const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();
const path = require('path');

// Import routes
const vendorRoutes = require('./routes/vendorRoutes');
const customerRoutes = require('./routes/customerRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Import middleware
const { errorHandler } = require('./middleware/errorMiddleware');
const { requestLogger } = require('./middleware/loggerMiddleware');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Test database connection
const db = require('./config/db');
db.connectDB().then(() => {
  console.log('Database connection initialized');
}).catch(err => {
  console.error('Database connection error:', err);
});

// Security middleware
app.use(helmet()); // Set security HTTP headers

// Parse JSON request body
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Enable CORS with specific options
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Handle preflight requests
app.options('*', cors(corsOptions));

// Enable CORS
app.use(cors(corsOptions));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Log HTTP requests in development
}
app.use(requestLogger); // Custom request logger

// Mount API routes
app.use('/api/products', productRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Root route for API health check
app.get('/api', (req, res) => {
  res.json({ 
    message: 'MarketConnect API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../frontend/build', 'index.html'));
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
