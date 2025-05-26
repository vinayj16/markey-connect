const pool = require('../config/db');

// Add item to cart
exports.addToCart = async (req, res) => {
  const customerId = req.user.id;
  const { productId, quantity } = req.body;

  try {
    // Check if product exists and is available
    const productCheck = await pool.query(
      'SELECT * FROM products WHERE product_id = $1 AND available_online = true',
      [productId]
    );
    
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found or not available online' });
    }
    
    const product = productCheck.rows[0];
    
    // Check if requested quantity is available
    if (product.stock_quantity < quantity) {
      return res.status(400).json({ 
        error: `Only ${product.stock_quantity} items available in stock`
      });
    }
    
    // Check if the product is already in the cart
    const cartCheck = await pool.query(
      'SELECT * FROM cart_items WHERE customer_id = $1 AND product_id = $2',
      [customerId, productId]
    );
    
    let result;
    
    if (cartCheck.rows.length > 0) {
      // Update existing cart item
      const newQuantity = cartCheck.rows[0].quantity + quantity;
      
      // Check again if new quantity exceeds available stock
      if (newQuantity > product.stock_quantity) {
        return res.status(400).json({ 
          error: `Cannot add ${quantity} more. Only ${product.stock_quantity} items available in stock`
        });
      }
      
      result = await pool.query(
        `UPDATE cart_items SET 
          quantity = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE customer_id = $2 AND product_id = $3 RETURNING *`,
        [newQuantity, customerId, productId]
      );
    } else {
      // Add new cart item
      result = await pool.query(
        `INSERT INTO cart_items (customer_id, product_id, quantity)
         VALUES ($1, $2, $3) RETURNING *`,
        [customerId, productId, quantity]
      );
    }
    
    res.status(200).json({ 
      message: 'Item added to cart',
      cartItem: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
};

// Get cart items
exports.getCart = async (req, res) => {
  const customerId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT ci.cart_item_id, ci.quantity, ci.product_id,
              p.name, p.price, p.image_url, p.stock_quantity,
              (p.price * ci.quantity) as total_price
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.product_id
       WHERE ci.customer_id = $1`,
      [customerId]
    );
    
    // Calculate cart totals
    const cartItems = result.rows;
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
    
    res.status(200).json({ 
      cartItems,
      cartSummary: {
        totalItems,
        subtotal: subtotal.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  const customerId = req.user.id;
  const { cartItemId } = req.params;
  const { quantity } = req.body;

  try {
    // Check if cart item belongs to the customer
    const cartItemCheck = await pool.query(
      'SELECT ci.*, p.stock_quantity FROM cart_items ci JOIN products p ON ci.product_id = p.product_id WHERE ci.cart_item_id = $1 AND ci.customer_id = $2',
      [cartItemId, customerId]
    );
    
    if (cartItemCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    const cartItem = cartItemCheck.rows[0];
    
    // Check if requested quantity is available
    if (quantity > cartItem.stock_quantity) {
      return res.status(400).json({ 
        error: `Only ${cartItem.stock_quantity} items available in stock`
      });
    }
    
    // Update cart item
    const result = await pool.query(
      `UPDATE cart_items SET 
        quantity = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE cart_item_id = $2 AND customer_id = $3 RETURNING *`,
      [quantity, cartItemId, customerId]
    );
    
    res.status(200).json({ 
      message: 'Cart item updated',
      cartItem: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  const customerId = req.user.id;
  const { cartItemId } = req.params;

  try {
    // Check if cart item belongs to the customer
    const cartItemCheck = await pool.query(
      'SELECT * FROM cart_items WHERE cart_item_id = $1 AND customer_id = $2',
      [cartItemId, customerId]
    );
    
    if (cartItemCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    // Delete cart item
    await pool.query(
      'DELETE FROM cart_items WHERE cart_item_id = $1 AND customer_id = $2',
      [cartItemId, customerId]
    );
    
    res.status(200).json({ 
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  const customerId = req.user.id;

  try {
    await pool.query(
      'DELETE FROM cart_items WHERE customer_id = $1',
      [customerId]
    );
    
    res.status(200).json({ 
      message: 'Cart cleared'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};
