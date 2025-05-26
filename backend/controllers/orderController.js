const pool = require('../config/db');

// Create a new order (online)
exports.createOrder = async (req, res) => {
  const customerId = req.user.id;
  const { 
    shippingAddress,
    paymentMethod
  } = req.body;

  try {
    // Start a database transaction
    await pool.query('BEGIN');
    
    // Get cart items
    const cartItemsResult = await pool.query(
      `SELECT ci.product_id, ci.quantity, p.price, p.stock_quantity, p.vendor_id
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.product_id
       WHERE ci.customer_id = $1`,
      [customerId]
    );
    
    if (cartItemsResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    const cartItems = cartItemsResult.rows;
    
    // Check stock availability
    for (const item of cartItems) {
      if (item.stock_quantity < item.quantity) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ 
          error: `Not enough stock available for product ID ${item.product_id}` 
        });
      }
    }
    
    // Calculate total amount
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity, 
      0
    );
    
    // Create order
    const orderResult = await pool.query(
      `INSERT INTO orders (
        customer_id, total_amount, shipping_address, 
        payment_method, status, payment_status, order_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        customerId,
        totalAmount,
        shippingAddress,
        paymentMethod,
        'pending', // initial status
        'pending', // initial payment status
        'online'
      ]
    );
    
    const order = orderResult.rows[0];
    
    // Create order items
    for (const item of cartItems) {
      await pool.query(
        `INSERT INTO order_items (
          order_id, product_id, quantity, unit_price
        ) VALUES ($1, $2, $3, $4)`,
        [
          order.order_id,
          item.product_id,
          item.quantity,
          item.price
        ]
      );
      
      // Update product stock
      await pool.query(
        `UPDATE products SET 
          stock_quantity = stock_quantity - $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE product_id = $2`,
        [item.quantity, item.product_id]
      );
    }
    
    // Clear customer's cart
    await pool.query(
      'DELETE FROM cart_items WHERE customer_id = $1',
      [customerId]
    );
    
    // Commit the transaction
    await pool.query('COMMIT');
    
    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    // Rollback the transaction on error
    await pool.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Create an in-store order request
exports.createInStoreOrder = async (req, res) => {
  const customerId = req.user.id;
  const { productId, quantity } = req.body;

  try {
    // Check if product exists and is available in store
    const productCheck = await pool.query(
      'SELECT * FROM products WHERE product_id = $1 AND available_in_store = true',
      [productId]
    );
    
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found or not available in store' });
    }
    
    const product = productCheck.rows[0];
    
    // Calculate total amount
    const totalAmount = parseFloat(product.price) * quantity;
    
    // Create order with in-store type
    const orderResult = await pool.query(
      `INSERT INTO orders (
        customer_id, total_amount, shipping_address, 
        payment_method, status, payment_status, order_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        customerId,
        totalAmount,
        'In-store pickup', // placeholder for in-store orders
        'in-store', // payment method
        'pending', // initial status
        'pending', // initial payment status
        'in_store'
      ]
    );
    
    const order = orderResult.rows[0];
    
    // Create order item
    await pool.query(
      `INSERT INTO order_items (
        order_id, product_id, quantity, unit_price
      ) VALUES ($1, $2, $3, $4)`,
      [
        order.order_id,
        productId,
        quantity,
        product.price
      ]
    );
    
    res.status(201).json({
      message: 'In-store order request created successfully',
      order
    });
  } catch (error) {
    console.error('Error creating in-store order:', error);
    res.status(500).json({ error: 'Failed to create in-store order request' });
  }
};

// Get customer orders
exports.getCustomerOrders = async (req, res) => {
  const customerId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT * FROM orders WHERE customer_id = $1 ORDER BY order_date DESC`,
      [customerId]
    );
    
    res.status(200).json({ orders: result.rows });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get order details by ID
exports.getOrderById = async (req, res) => {
  const customerId = req.user.id;
  const { orderId } = req.params;

  try {
    // Get order
    const orderResult = await pool.query(
      `SELECT * FROM orders WHERE order_id = $1 AND customer_id = $2`,
      [orderId, customerId]
    );
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orderResult.rows[0];
    
    // Get order items
    const orderItemsResult = await pool.query(
      `SELECT oi.*, p.name, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.product_id
       WHERE oi.order_id = $1`,
      [orderId]
    );
    
    res.status(200).json({
      order,
      items: orderItemsResult.rows
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
};

// Get vendor orders (for vendors to see orders for their products)
exports.getVendorOrders = async (req, res) => {
  const vendorId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT DISTINCT o.* 
       FROM orders o
       JOIN order_items oi ON o.order_id = oi.order_id
       JOIN products p ON oi.product_id = p.product_id
       WHERE p.vendor_id = $1
       ORDER BY o.order_date DESC`,
      [vendorId]
    );
    
    res.status(200).json({ orders: result.rows });
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    res.status(500).json({ error: 'Failed to fetch vendor orders' });
  }
};

// Update order status (vendor only)
exports.updateOrderStatus = async (req, res) => {
  const vendorId = req.user.id;
  const { orderId } = req.params;
  const { status } = req.body;
  
  // Valid status values
  const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    // Check if the vendor has products in this order
    const vendorCheck = await pool.query(
      `SELECT DISTINCT o.order_id 
       FROM orders o
       JOIN order_items oi ON o.order_id = oi.order_id
       JOIN products p ON oi.product_id = p.product_id
       WHERE o.order_id = $1 AND p.vendor_id = $2`,
      [orderId, vendorId]
    );
    
    if (vendorCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You do not have permission to update this order' });
    }
    
    // Update order status
    const result = await pool.query(
      `UPDATE orders SET 
        status = $1,
        updated_at = CURRENT_TIMESTAMP
       WHERE order_id = $2 RETURNING *`,
      [status, orderId]
    );
    
    res.status(200).json({
      message: 'Order status updated successfully',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};
