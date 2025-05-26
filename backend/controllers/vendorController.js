const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = process.env.JWT_SECRET || 'marketconnect_jwt_secret';

// Register a new vendor
exports.registerVendor = async (req, res) => {
  const {
    businessName,
    businessType,
    businessAddress,
    registrationNumber,
    contactPerson,
    email,
    phone,
    username,
    password,
    logo
  } = req.body;

  try {
    // Check if vendor with email already exists
    const emailCheck = await pool.query('SELECT * FROM vendors WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Check if username is already taken
    const usernameCheck = await pool.query('SELECT * FROM vendors WHERE username = $1', [username]);
    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create vendor
    const result = await pool.query(
      `INSERT INTO vendors (
        business_name, business_type, business_address, registration_number,
        contact_person_name, email, phone, username, password, logo_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        businessName,
        businessType,
        businessAddress,
        registrationNumber,
        contactPerson,
        email,
        phone,
        username,
        hashedPassword,
        logo
      ]
    );
    
    const vendor = result.rows[0];
    
    // Generate QR code with vendor information
    const vendorData = {
      vendorId: vendor.vendor_id,
      businessName: vendor.business_name,
      registrationNumber: vendor.registration_number
    };
    
    // Convert data to JSON string
    const vendorDataString = JSON.stringify(vendorData);
    
    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(vendorDataString);
    
    // Update vendor with QR code URL
    await pool.query(
      'UPDATE vendors SET qr_code_url = $1 WHERE vendor_id = $2',
      [qrCodeDataUrl, vendor.vendor_id]
    );
    
    // Create token
    const token = jwt.sign({ 
      id: vendor.vendor_id, 
      email: vendor.email,
      role: 'vendor'
    }, JWT_SECRET, { expiresIn: '24h' });
    
    // Remove password from response
    delete vendor.password;
    
    res.status(201).json({ 
      message: 'Vendor registered successfully',
      vendor: {
        ...vendor,
        qr_code: qrCodeDataUrl
      },
      token
    });
  } catch (error) {
    console.error('Vendor registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login vendor
exports.loginVendor = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find vendor by email
    const result = await pool.query('SELECT * FROM vendors WHERE email = $1', [email]);
    const vendor = result.rows[0];

    if (!vendor) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, vendor.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign({ 
      id: vendor.vendor_id, 
      email: vendor.email,
      role: 'vendor'
    }, JWT_SECRET, { expiresIn: '24h' });

    // Remove password from response
    delete vendor.password;

    res.status(200).json({ 
      message: 'Login successful',
      vendor,
      token
    });
  } catch (error) {
    console.error('Vendor login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get vendor profile
exports.getVendorProfile = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const result = await pool.query('SELECT * FROM vendors WHERE vendor_id = $1', [vendorId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    const vendor = result.rows[0];
    delete vendor.password;
    
    res.status(200).json({ vendor });
  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Update vendor profile
exports.updateVendorProfile = async (req, res) => {
  const vendorId = req.user.id;
  const {
    businessName,
    businessType,
    businessAddress,
    contactPerson,
    phone,
    logo
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE vendors SET 
        business_name = $1, 
        business_type = $2, 
        business_address = $3, 
        contact_person_name = $4, 
        phone = $5, 
        logo_url = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE vendor_id = $7 RETURNING *`,
      [
        businessName,
        businessType,
        businessAddress,
        contactPerson,
        phone,
        logo,
        vendorId
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    const vendor = result.rows[0];
    delete vendor.password;
    
    res.status(200).json({ 
      message: 'Profile updated successfully',
      vendor
    });
  } catch (error) {
    console.error('Error updating vendor profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Get vendor ID card
exports.getVendorIdCard = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const result = await pool.query(
      'SELECT vendor_id, business_name, registration_number, qr_code_url FROM vendors WHERE vendor_id = $1',
      [vendorId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    const vendor = result.rows[0];
    
    if (!vendor.qr_code_url) {
      // Generate QR code if it doesn't exist
      const vendorData = {
        vendorId: vendor.vendor_id,
        businessName: vendor.business_name,
        registrationNumber: vendor.registration_number
      };
      
      const vendorDataString = JSON.stringify(vendorData);
      const qrCodeDataUrl = await QRCode.toDataURL(vendorDataString);
      
      await pool.query(
        'UPDATE vendors SET qr_code_url = $1 WHERE vendor_id = $2',
        [qrCodeDataUrl, vendor.vendor_id]
      );
      
      vendor.qr_code_url = qrCodeDataUrl;
    }
    
    res.status(200).json({ 
      idCardData: {
        vendorId: vendor.vendor_id,
        businessName: vendor.business_name,
        registrationNumber: vendor.registration_number,
        qrCode: vendor.qr_code_url
      }
    });
  } catch (error) {
    console.error('Error generating vendor ID card:', error);
    res.status(500).json({ error: 'Failed to generate ID card' });
  }
};
