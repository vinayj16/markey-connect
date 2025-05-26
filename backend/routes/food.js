const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// Get all food products
router.get('/', async (req, res) => {
  try {
    const { sort, filter, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, v.name as vendor_name 
      FROM products p
      JOIN vendors v ON p.vendor_id = v.id
      WHERE p.category = 'food'
    `;

    // Apply filters
    if (filter) {
      const filters = JSON.parse(filter);
      if (filters.dietary) {
        query += ` AND (${filters.dietary.map(diet => `p.${diet} = true`).join(' OR ')})`;
      }
      if (filters.priceRange) {
        query += ` AND p.price BETWEEN ${filters.priceRange[0]} AND ${filters.priceRange[1]}`;
      }
    }

    // Apply sorting
    if (sort) {
      switch (sort) {
        case 'price-low':
          query += ' ORDER BY p.price ASC';
          break;
        case 'price-high':
          query += ' ORDER BY p.price DESC';
          break;
        case 'popular':
          query += ' ORDER BY p.sales_count DESC';
          break;
        default:
          query += ' ORDER BY p.created_at DESC';
      }
    }

    // Add pagination
    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const [products] = await db.query(query);
    res.json({ products });
  } catch (error) {
    console.error('Error fetching food products:', error);
    res.status(500).json({ message: 'Error fetching food products' });
  }
});

// Get food product by ID
router.get('/:id', async (req, res) => {
  try {
    const [product] = await db.query(
      `SELECT p.*, v.name as vendor_name 
       FROM products p
       JOIN vendors v ON p.vendor_id = v.id
       WHERE p.id = ? AND p.category = 'food'`,
      [req.params.id]
    );

    if (!product[0]) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product[0]);
  } catch (error) {
    console.error('Error fetching food product:', error);
    res.status(500).json({ message: 'Error fetching food product' });
  }
});

// Add food product (vendor only)
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      image_url,
      stock_quantity,
      is_vegetarian,
      is_vegan,
      is_gluten_free,
      is_organic,
      nutrition_facts
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO products (
        name, description, price, image_url, stock_quantity,
        is_vegetarian, is_vegan, is_gluten_free, is_organic,
        nutrition_facts, category, vendor_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'food', ?)`,
      [
        name,
        description,
        price,
        image_url,
        stock_quantity,
        is_vegetarian,
        is_vegan,
        is_gluten_free,
        is_organic,
        JSON.stringify(nutrition_facts),
        req.user.id
      ]
    );

    res.status(201).json({
      message: 'Food product added successfully',
      productId: result.insertId
    });
  } catch (error) {
    console.error('Error adding food product:', error);
    res.status(500).json({ message: 'Error adding food product' });
  }
});

// Update food product (vendor only)
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      image_url,
      stock_quantity,
      is_vegetarian,
      is_vegan,
      is_gluten_free,
      is_organic,
      nutrition_facts
    } = req.body;

    const [result] = await db.query(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, image_url = ?,
           stock_quantity = ?, is_vegetarian = ?, is_vegan = ?,
           is_gluten_free = ?, is_organic = ?, nutrition_facts = ?
       WHERE id = ? AND vendor_id = ? AND category = 'food'`,
      [
        name,
        description,
        price,
        image_url,
        stock_quantity,
        is_vegetarian,
        is_vegan,
        is_gluten_free,
        is_organic,
        JSON.stringify(nutrition_facts),
        req.params.id,
        req.user.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    res.json({ message: 'Food product updated successfully' });
  } catch (error) {
    console.error('Error updating food product:', error);
    res.status(500).json({ message: 'Error updating food product' });
  }
});

// Delete food product (vendor only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM products WHERE id = ? AND vendor_id = ? AND category = "food"',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    res.json({ message: 'Food product deleted successfully' });
  } catch (error) {
    console.error('Error deleting food product:', error);
    res.status(500).json({ message: 'Error deleting food product' });
  }
});

// Get food products by subcategory
router.get('/subcategory/:subcategory', async (req, res) => {
  try {
    const { subcategory } = req.params;
    const { sort, filter, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, v.name as vendor_name 
      FROM products p
      JOIN vendors v ON p.vendor_id = v.id
      WHERE p.category = 'food' AND p.subcategory = ?
    `;

    // Apply filters
    if (filter) {
      const filters = JSON.parse(filter);
      if (filters.dietary) {
        query += ` AND (${filters.dietary.map(diet => `p.${diet} = true`).join(' OR ')})`;
      }
      if (filters.priceRange) {
        query += ` AND p.price BETWEEN ${filters.priceRange[0]} AND ${filters.priceRange[1]}`;
      }
    }

    // Apply sorting
    if (sort) {
      switch (sort) {
        case 'price-low':
          query += ' ORDER BY p.price ASC';
          break;
        case 'price-high':
          query += ' ORDER BY p.price DESC';
          break;
        case 'popular':
          query += ' ORDER BY p.sales_count DESC';
          break;
        default:
          query += ' ORDER BY p.created_at DESC';
      }
    }

    // Add pagination
    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const [products] = await db.query(query, [subcategory]);
    res.json({ products });
  } catch (error) {
    console.error('Error fetching food products by subcategory:', error);
    res.status(500).json({ message: 'Error fetching food products by subcategory' });
  }
});

// Get food subcategories
router.get('/subcategories', async (req, res) => {
  try {
    const [subcategories] = await db.query(
      `SELECT DISTINCT subcategory, COUNT(*) as product_count 
       FROM products 
       WHERE category = 'food' 
       GROUP BY subcategory`
    );
    res.json({ subcategories });
  } catch (error) {
    console.error('Error fetching food subcategories:', error);
    res.status(500).json({ message: 'Error fetching food subcategories' });
  }
});

module.exports = router; 