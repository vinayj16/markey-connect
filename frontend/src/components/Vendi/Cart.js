import React, { useState, useEffect } from 'react';
import './Cart.css';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiClock, FiTag, FiTruck, FiX, FiArrowRight } from 'react-icons/fi';
import { customerAPI, isCustomerLoggedIn } from '../../utils/api';
import MainLayout from '../layout/MainLayout';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist } from '../../store/wishlistSlice';
import { removeFromCart, updateQuantity } from '../../store/slices/cartSlice';
import { addNotification } from '../../store/slices/uiSlice';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({ 
    totalItems: 0, 
    subtotal: 0,
    discount: 0,
    estimatedDelivery: ''
  });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingForLater, setSavingForLater] = useState({});
  const [error, setError] = useState('');
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const cart = useSelector((state) => state.cart);
  
  // Get today's date + 3-7 days for estimated delivery
  const getEstimatedDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 5) + 3);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  useEffect(() => {
    // Check if user is logged in
    if (!isCustomerLoggedIn()) {
      navigate('/vendi/login', { state: { from: '/vendi/cart' } });
      return;
    }
    
    // Fetch cart data
    fetchCartData();
    
    // Fetch suggested products
    const fetchSuggestedProducts = async () => {
      try {
        const response = await customerAPI.getProducts({ limit: 3 });
        setSuggestedProducts(response.data.products);
      } catch (err) {
        console.error('Error fetching suggested products:', err);
      }
    };
    
    fetchSuggestedProducts();
  }, [navigate]);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getCart();
      setCartItems(response.data.cartItems);
      setCartSummary({
        ...response.data.cartSummary,
        estimatedDelivery: getEstimatedDeliveryDate()
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart. Please try again.');
      setLoading(false);
    }
  };
  
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    try {
      // In a real app, you would validate the coupon with your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // For demo purposes, apply a 10% discount
      const discount = cartSummary.subtotal * 0.1;
      setAppliedCoupon({
        code: couponCode,
        discount: discount.toFixed(2)
      });
      
      setCartSummary(prev => ({
        ...prev,
        discount: parseFloat(discount.toFixed(2))
      }));
      
      setError('');
    } catch (err) {
      setError('Invalid or expired coupon code');
    }
  };
  
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCartSummary(prev => ({
      ...prev,
      discount: 0
    }));
  };
  
  const handleSaveForLater = async (item) => {
    try {
      setSavingForLater(prev => ({ ...prev, [item.cart_item_id]: true }));
      
      // In a real app, you would call an API to move to save for later
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo, just remove from cart
      await handleRemoveItem(item.cart_item_id);
      
      // Add to wishlist
      dispatch(addToWishlist({
        id: item.product_id,
        name: item.name,
        price: item.price,
        image_url: item.image_url
      }));
      
      setSavingForLater(prev => ({ ...prev, [item.cart_item_id]: false }));
    } catch (err) {
      console.error('Error saving for later:', err);
      setSavingForLater(prev => ({ ...prev, [item.cart_item_id]: false }));
    }
  };

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await customerAPI.updateCartItem(cartItemId, newQuantity);
      // Refresh cart data
      fetchCartData();
    } catch (err) {
      console.error('Error updating cart:', err);
      setError(err.response?.data?.error || 'Failed to update cart. Please try again.');
    }
  };

  const handleRemoveItem = (cartItemId) => {
    dispatch(removeFromCart(cartItemId));
    dispatch(addNotification({
      type: 'info',
      message: 'Item removed from cart',
    }));
  };

  const handleQuantityChange = (id, quantity) => {
    if (quantity > 0) {
      dispatch(updateQuantity({ id, quantity }));
    }
  };

  const handleContinueShopping = () => {
    navigate('/vendi/products/all');
  };

  const handleCheckout = () => {
    navigate('/vendi/checkout');
  };

  // Calculate totals
  const subtotal = parseFloat(cartSummary.subtotal) || 0;
  const shipping = 0; // Assuming free shipping
  const discount = parseFloat(cartSummary.discount) || 0;
  const total = Math.max(0, subtotal + shipping - discount);

  // Loading skeleton
  const renderLoadingSkeleton = () => (
    <div className="skeleton-container">
      <div className="skeleton-header"></div>
      {[1, 2, 3].map((item) => (
        <div key={item} className="skeleton-item">
          <div className="skeleton-image"></div>
          <div className="skeleton-details">
            <div className="skeleton-line"></div>
            <div className="skeleton-line medium"></div>
            <div className="skeleton-line small"></div>
            <div className="skeleton-actions"></div>
          </div>
        </div>
      ))}
      <div className="skeleton-summary"></div>
    </div>
  );

  // Empty cart state
  const renderEmptyCart = () => (
    <div className="empty-cart">
      <div className="empty-cart-icon">
        <FiShoppingBag size={48} />
      </div>
      <h2>Your cart is empty</h2>
      <p>Looks like you haven't added any products to your cart yet.</p>
      <button className="btn btn-primary" onClick={handleContinueShopping}>
        Continue Shopping
      </button>
      
      {suggestedProducts.length > 0 && (
        <div className="suggested-products">
          <h3>You might be interested in</h3>
          <div className="suggested-products-grid">
            {suggestedProducts.map(product => (
              <div key={product.id} className="suggested-product">
                <div className="suggested-product-image">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} />
                  ) : (
                    <div className="placeholder-image">No Image</div>
                  )}
                </div>
                <h4>{product.name}</h4>
                <p className="price">${parseFloat(product.price).toFixed(2)}</p>
                <button 
                  className="btn btn-outline"
                  onClick={() => navigate(`/vendi/product-details?id=${product.id}`)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <MainLayout userType="customer" pageTitle="Your Shopping Cart" showSearchBar={true}>
      <div className="cart-container">
        {loading ? (
          renderLoadingSkeleton()
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : cartItems.length === 0 ? (
          renderEmptyCart()
        ) : (
          <div className="cart-layout">
            <div className="cart-main">
              <div className="cart-header">
                <h1>Your Cart ({cartSummary.totalItems} {cartSummary.totalItems === 1 ? 'item' : 'items'})</h1>
                <button className="continue-shopping" onClick={handleContinueShopping}>
                  <FiArrowRight /> Continue Shopping
                </button>
              </div>
              
              <div className="cart-items">
                <div className="cart-items-header">
                  <span>Product</span>
                  <span>Price</span>
                  <span>Quantity</span>
                  <span>Total</span>
                </div>
                
                <ul>
                  {cartItems.map(item => (
                    <li key={item.cart_item_id} className="cart-item">
                      <div className="item-main">
                        <div className="item-image">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.name} 
                              onClick={() => navigate(`/vendi/product-details?id=${item.product_id}`)}
                            />
                          ) : (
                            <div className="placeholder-image">No Image</div>
                          )}
                        </div>
                        
                        <div className="item-details">
                          <h3 onClick={() => navigate(`/vendi/product-details?id=${item.product_id}`)}>
                            {item.name}
                          </h3>
                          
                          <div className="item-actions">
                            <button 
                              className="save-for-later"
                              onClick={() => handleSaveForLater(item)}
                              disabled={savingForLater[item.cart_item_id]}
                            >
                              {savingForLater[item.cart_item_id] ? 'Saving...' : 'Save for later'}
                            </button>
                            <button 
                              className="remove-item"
                              onClick={() => handleRemoveItem(item.cart_item_id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="item-price">
                        ${parseFloat(item.price).toFixed(2)}
                        {item.original_price > item.price && (
                          <span className="original-price">
                            ${parseFloat(item.original_price).toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      <div className="quantity-controls">
                        <button 
                          onClick={() => handleQuantityChange(item.cart_item_id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => handleQuantityChange(item.cart_item_id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock_quantity}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="item-total">
                        <span className="total-amount">
                          ${parseFloat(item.total_price).toFixed(2)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="per-unit">
                            ${parseFloat(item.price).toFixed(2)} each
                          </span>
                        )}
                      </div>
                      
                      {item.stock_quantity <= 5 && (
                        <div className="stock-warning">
                          <FiClock className="icon" />
                          {item.stock_quantity === 1 
                            ? 'Only 1 left!' 
                            : `Only ${item.stock_quantity} left!`}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
            
            <div className="order-summary">
              <h2>Order Summary</h2>
              
              {cartSummary.estimatedDelivery && (
                <div className="delivery-estimate">
                  <FiTruck className="icon" />
                  <div>
                    <p>Estimated Delivery</p>
                    <p className="delivery-date">{cartSummary.estimatedDelivery}</p>
                  </div>
                </div>
              )}
              
              <div className="coupon-section">
                <div className="coupon-input">
                  <FiTag className="icon" />
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <button 
                      className="btn-remove-coupon"
                      onClick={handleRemoveCoupon}
                      aria-label="Remove coupon"
                    >
                      <FiX />
                    </button>
                  ) : (
                    <button 
                      className="btn-apply-coupon"
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim()}
                    >
                      Apply
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <div className="coupon-applied">
                    Coupon <strong>{appliedCoupon.code}</strong> applied successfully!
                  </div>
                )}
              </div>
              
              <div className="summary-details">
                <div className="summary-row">
                  <span>Subtotal ({cartSummary.totalItems} {cartSummary.totalItems === 1 ? 'item' : 'items'})</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="summary-row discount">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="summary-row shipping">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              <button 
                className="proceed-to-checkout" 
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </button>
              
              <div className="secure-checkout">
                <img src="/images/secure-checkout.png" alt="Secure Checkout" />
                <p>Secure SSL checkout</p>
              </div>
              
              <div className="accepted-payments">
                <p>We accept:</p>
                <div className="payment-methods">
                  <img src="/images/visa.png" alt="Visa" />
                  <img src="/images/mastercard.png" alt="Mastercard" />
                  <img src="/images/amex.png" alt="American Express" />
         