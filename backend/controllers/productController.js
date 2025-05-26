const pool = require('../config/db');

// Add a new product
exports.addProduct = async (req, res) => {
  const vendorId = req.user.id;
  const {
    name, 
    description, 
    price, 
    stockQuantity, 
    category, 
    imageUrl,
    availableOnline,
    availableInStore
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO products (
        vendor_id, name, description, price, stock_quantity, 
        category, image_url, available_online, available_in_store
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        vendorId, 
        name, 
        description, 
        price, 
        stockQuantity, 
        category, 
        imageUrl,
        availableOnline !== undefined ? availableOnline : true,
        availableInStore !== undefined ? availableInStore : true
      ]
    );
    
    const product = result.rows[0];
    
    res.status(201).json({ 
      message: 'Product added successfully',
      product
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
};

// Get trending products
exports.getTrendingProducts = async (req, res) => {
  try {
    console.log('Fetching trending products...');
    const result = await pool.query(
      `SELECT p.*, v.business_name as vendor_name 
       FROM products p 
       JOIN vendors v ON p.vendor_id = v.vendor_id 
       WHERE p.available_online = true 
       ORDER BY p.views DESC, p.created_at DESC 
       LIMIT 10`
    );
    
    console.log('Trending products found:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching trending products:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      query: error.query
    });
    res.status(500).json({ error: 'Failed to fetch trending products', details: error.message });
  }
};

// Get flash deals
exports.getFlashDeals = async (req, res) => {
  try {
    console.log('Fetching flash deals...');
    const result = await pool.query(
      `SELECT p.*, v.business_name as vendor_name 
       FROM products p 
       JOIN vendors v ON p.vendor_id = v.vendor_id 
       WHERE p.available_online = true 
       AND p.discount_price IS NOT NULL 
       AND p.discount_end_date > NOW() 
       ORDER BY (p.price - p.discount_price) / p.price DESC 
       LIMIT 8`
    );
    
    console.log('Flash deals found:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching flash deals:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      query: error.query
    });
    res.status(500).json({ error: 'Failed to fetch flash deals', details: error.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  const { category, search } = req.query;
  
  try {
    let query = 'SELECT * FROM products WHERE 1=1';
    const queryParams = [];
    
    // Filter by category if provided
    if (category) {
      query += ' AND category = $' + (queryParams.length + 1);
      queryParams.push(category);
    }
    
    // Filter by search term if provided
    if (search) {
      query += ' AND (name ILIKE $' + (queryParams.length + 1) + 
              ' OR description ILIKE $' + (queryParams.length + 1) + ')';
      queryParams.push(`%${search}%`);
    }
    
    // Add sorting by newest first
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, queryParams);
    
    res.status(200).json({ 
      products: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get products by vendor ID
exports.getVendorProducts = async (req, res) => {
  const vendorId = req.user.id;
  
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE vendor_id = $1 ORDER BY created_at DESC',
      [vendorId]
    );
    
    res.status(200).json({ 
      products: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching vendor products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  const productId = req.params.id;
  
  try {
    const result = await pool.query(
      `SELECT p.*, v.business_name as vendor_name 
       FROM products p 
       JOIN vendors v ON p.vendor_id = v.vendor_id 
       WHERE p.product_id = $1`,
      [productId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.status(200).json({ product: result.rows[0] });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  const vendorId = req.user.id;
  const productId = req.params.id;
  const {
    name, 
    description, 
    price, 
    stockQuantity, 
    category, 
    imageUrl,
    availableOnline,
    availableInStore
  } = req.body;

  try {
    // Check if product belongs to the vendor
    const productCheck = await pool.query(
      'SELECT * FROM products WHERE product_id = $1 AND vendor_id = $2',
      [productId, vendorId]
    );
    
    if (productCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You do not have permission to update this product' });
    }
    
    const result = await pool.query(
      `UPDATE products SET 
        name = $1, 
        description = $2, 
        price = $3, 
        stock_quantity = $4, 
        category = $5, 
        image_url = $6,
        available_online = $7,
        available_in_store = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $9 AND vendor_id = $10 RETURNING *`,
      [
        name, 
        description, 
        price, 
        stockQuantity, 
        category, 
        imageUrl,
        availableOnline,
        availableInStore,
        productId,
        vendorId
      ]
    );
    
    res.status(200).json({ 
      message: 'Product updated successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  const vendorId = req.user.id;
  const productId = req.params.id;

  try {
    // Check if product belongs to the vendor
    const productCheck = await pool.query(
      'SELECT * FROM products WHERE product_id = $1 AND vendor_id = $2',
      [productId, vendorId]
    );
    
    if (productCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You do not have permission to delete this product' });
    }
    
    await pool.query(
      'DELETE FROM products WHERE product_id = $1 AND vendor_id = $2',
      [productId, vendorId]
    );
    
    res.status(200).json({ 
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
