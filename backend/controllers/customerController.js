const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'marketconnect_jwt_secret';

// Register a new customer
exports.registerCustomer = async (req, res) => {
  console.log('Register customer request received:', req.body);
  const { name, email, password, phone, address } = req.body;
  
  if (!name || !email || !password) {
    console.log('Missing required fields');
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    // Check if email already exists
    const emailCheck = await pool.query('SELECT * FROM customers WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create customer
    const result = await pool.query(
      `INSERT INTO customers (name, email, password, phone, address)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, email, hashedPassword, phone, address]
    );
    
    const customer = result.rows[0];
    
    // Create token
    const token = jwt.sign({ 
      id: customer.customer_id, 
      email: customer.email,
      role: 'customer'
    }, JWT_SECRET, { expiresIn: '24h' });
    
    // Remove password from response
    delete customer.password;
    
    res.status(201).json({ 
      message: 'Registration successful',
      customer,
      token
    });
  } catch (error) {
    console.error('Customer registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login customer
exports.loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find customer by email
    const result = await pool.query('SELECT * FROM customers WHERE email = $1', [email]);
    const customer = result.rows[0];

    if (!customer) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, customer.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign({ 
      id: customer.customer_id, 
      email: customer.email,
      role: 'customer'
    }, JWT_SECRET, { expiresIn: '24h' });

    // Remove password from response
    delete customer.password;

    res.status(200).json({ 
      message: 'Login successful',
      customer,
      token
    });
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Social login/signup (Google, Facebook, Twitter)
exports.socialAuth = async (req, res) => {
  const { name, email, authProvider, authProviderId } = req.body;

  try {
    // Check if user exists with this email
    const userCheck = await pool.query('SELECT * FROM customers WHERE email = $1', [email]);
    
    let customer;
    
    if (userCheck.rows.length > 0) {
      // User exists, update auth provider info if needed
      customer = userCheck.rows[0];
      
      if (customer.auth_provider !== authProvider || customer.auth_provider_id !== authProviderId) {
        const updateResult = await pool.query(
          `UPDATE customers SET 
            auth_provider = $1, 
            auth_provider_id = $2,
            updated_at = CURRENT_TIMESTAMP
          WHERE customer_id = $3 RETURNING *`,
          [authProvider, authProviderId, customer.customer_id]
        );
        customer = updateResult.rows[0];
      }
    } else {
      // Create new user
      const result = await pool.query(
        `INSERT INTO customers (name, email, password, auth_provider, auth_provider_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [name, email, 'SOCIAL_AUTH_' + Math.random().toString(36).slice(2), authProvider, authProviderId]
      );
      customer = result.rows[0];
    }
    
    // Create token
    const token = jwt.sign({ 
      id: customer.customer_id, 
      email: customer.email,
      role: 'customer'
    }, JWT_SECRET, { expiresIn: '24h' });
    
    // Remove password from response
    delete customer.password;
    
    res.status(200).json({ 
      message: 'Social authentication successful',
      customer,
      token
    });
  } catch (error) {
    console.error('Social auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Get customer profile
exports.getCustomerProfile = async (req, res) => {
  try {
    const customerId = req.user.id;
    const result = await pool.query('SELECT * FROM customers WHERE customer_id = $1', [customerId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const customer = result.rows[0];
    delete customer.password;
    
    res.status(200).json({ customer });
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Update customer profile
exports.updateCustomerProfile = async (req, res) => {
  const customerId = req.user.id;
  const { name, phone, address } = req.body;

  try {
    const result = await pool.query(
      `UPDATE customers SET 
        name = $1, 
        phone = $2, 
        address = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE customer_id = $4 RETURNING *`,
      [name, phone, address, customerId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const customer = result.rows[0];
    delete customer.password;
    
    res.status(200).json({ 
      message: 'Profile updated successfully',
      customer
    });
  } catch (error) {
    console.error('Error updating customer profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const result = await pool.query('SELECT * FROM customers WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({ message: 'If your email is in our system, you will receive a password reset link.' });
    }
    
    // In a real application, send an email with a password reset token
    // For this example, we'll just return a success message
    
    res.status(200).json({ 
      message: 'If your email is in our system, you will receive a password reset link.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;

  try {
    // In a real application, validate the token
    // For this example, we'll skip token validation
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await pool.query(
      `UPDATE customers SET 
        password = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE email = $2`,
      [hashedPassword, email]
    );
    
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};
