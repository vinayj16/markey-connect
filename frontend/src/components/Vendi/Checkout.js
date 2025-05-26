import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiLock, FiCreditCard, FiTruck, FiCheck, FiChevronDown } from 'react-icons/fi';
import MainLayout from '../layout/MainLayout';
import { customerAPI, isCustomerLoggedIn } from '../../utils/api';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../../store/cartSlice';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: cartItems, total: cartTotal } = useSelector((state) => state.cart);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    saveInfo: false,
    paymentMethod: 'credit-card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    upiId: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isCustomerLoggedIn()) {
      navigate('/vendi/login', { state: { from: '/vendi/checkout' } });
      return;
    }
    
    // Load saved address if available
    const loadSavedAddress = async () => {
      try {
        const response = await customerAPI.getProfile();
        if (response.data) {
          const { email, phone, full_name, address } = response.data;
          setFormData(prev => ({
            ...prev,
            email: email || '',
            phoneNumber: phone || '',
            fullName: full_name || '',
            addressLine1: address?.line1 || '',
            addressLine2: address?.line2 || '',
            city: address?.city || '',
            state: address?.state || '',
            postalCode: address?.postal_code || ''
          }));
        }
      } catch (error) {
        console.error('Error loading saved address:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSavedAddress();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = (step) => {
    const errors = {};
    
    if (step === 1) {
      if (!formData.email) errors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
      
      if (!formData.fullName) errors.fullName = 'Full name is required';
      if (!formData.phoneNumber) errors.phoneNumber = 'Phone number is required';
      if (!formData.addressLine1) errors.addressLine1 = 'Address is required';
      if (!formData.city) errors.city = 'City is required';
      if (!formData.state) errors.state = 'State is required';
      if (!formData.postalCode) errors.postalCode = 'Postal code is required';
    } 
    
    if (step === 2) {
      if (formData.paymentMethod === 'credit-card') {
        if (!formData.cardNumber) errors.cardNumber = 'Card number is required';
        if (!formData.expiryDate) errors.expiryDate = 'Expiry date is required';
        if (!formData.cvv) errors.cvv = 'CVV is required';
        if (!formData.cardName) errors.cardName = 'Name on card is required';
      } else if (formData.paymentMethod === 'upi' && !formData.upiId) {
        errors.upiId = 'UPI ID is required';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    const errors = validateForm(activeStep);
    if (Object.keys(errors).length === 0) {
      if (activeStep === 1) {
        navigate('/vendi/checkout/payment', { 
          state: { 
            shippingInfo: {
              email: formData.email,
              fullName: formData.fullName,
              phoneNumber: formData.phoneNumber,
              address: {
                line1: formData.addressLine1,
                line2: formData.addressLine2 || '',
                city: formData.city,
                state: formData.state,
                postalCode: formData.postalCode,
                country: formData.country
              }
            },
            saveInfo: formData.saveInfo,
            cartItems: cartItems.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image_url: item.image_url
            }))
          }
        });
      } else {
        setActiveStep(prev => prev + 1);
      }
    } else {
      setFormErrors(errors);
    }
  };

  const handlePrevStep = () => {
    setActiveStep(activeStep - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm(activeStep)) return;
    
    setIsSubmitting(true);
    
    try {
      // Save address if user opted in
      if (formData.saveInfo) {
        await customerAPI.updateProfile({
          full_name: formData.fullName,
          phone: formData.phoneNumber,
          address: {
            line1: formData.addressLine1,
            line2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postalCode,
            country: formData.country
          }
        });
      }
      
      // Process payment
      const paymentData = {
        method: formData.paymentMethod,
        ...(formData.paymentMethod === 'credit-card' ? {
          card: {
            number: formData.cardNumber.replace(/\s/g, ''),
            exp_month: formData.expiryDate.split('/')[0],
            exp_year: formData.expiryDate.split('/')[1],
            cvc: formData.cvv,
            name: formData.cardName
          }
        } : {
          upi_id: formData.upiId
        })
      };
      
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_address: {
          line1: formData.addressLine1,
          line2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postalCode,
          country: formData.country
        },
        payment: paymentData
      };
      
      const response = await customerAPI.createOrder(orderData);
      
      // Clear cart on successful order
      dispatch(clearCart());
      
      // Navigate to order confirmation page with order details
      navigate('/vendi/order-confirmation', { 
        state: { 
          orderId: response.data.order_id,
          orderTotal: cartTotal
        } 
      });
      
    } catch (error) {
      console.error('Checkout error:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? (subtotal > 1000 ? 0 : 49) : 0; // Free shipping over 1000
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
  };
  
  const { subtotal, shipping, tax, total } = calculateTotals();

  if (loading) {
    return (
      <MainLayout userType="customer" pageTitle="Loading..." showSearchBar={false}>
        <div className="checkout-loading">
          <div className="spinner"></div>
          <p>Loading your checkout information...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userType="customer" pageTitle="Secure Checkout" showSearchBar={false}>
      <div className="checkout-container">
        {/* Checkout Progress */}
        <div className="checkout-progress">
          <div className={`progress-step ${activeStep >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Shipping</div>
          </div>
          <div className={`progress-connector ${activeStep >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${activeStep === 2 ? 'active' : ''} ${activeStep > 2 ? 'completed' : ''}`}>
            <div className="step-number">{activeStep > 2 ? <FiCheck /> : '2'}</div>
            <div className="step-label">Payment</div>
          </div>
          <div className={`progress-connector ${activeStep >= 3 ? 'active' : ''}`}></div>
          <div className={`progress-step ${activeStep === 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Confirmation</div>
          </div>
        </div>

        <div className="checkout-layout">
          {/* Main Checkout Form */}
          <div className="checkout-main">
            <form onSubmit={handleSubmit} className="checkout-form">
              {activeStep === 1 && (
                <div className="form-section">
                  <div className="section-header">
                    <h2><FiTruck /> Shipping Information</h2>
                    {isCustomerLoggedIn() && (
                      <label className="save-address">
                        <input
                          type="checkbox"
                          name="saveInfo"
                          checked={formData.saveInfo}
                          onChange={handleChange}
                        />
                        Save this information for next time
                      </label>
                    )}
                  </div>
                  
                  <div className="form-grid">
                    <div className={`form-group ${formErrors.email ? 'error' : ''}`}>
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        className={formErrors.email ? 'error' : ''}
                      />
                      {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                    </div>
                    
                    <div className={`form-group ${formErrors.fullName ? 'error' : ''}`}>
                      <label htmlFor="fullName">Full Name</label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={formErrors.fullName ? 'error' : ''}
                      />
                      {formErrors.fullName && <span className="error-message">{formErrors.fullName}</span>}
                    </div>
                    
                    <div className={`form-group ${formErrors.phoneNumber ? 'error' : ''}`}>
                      <label htmlFor="phoneNumber">Phone Number</label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="+91 9876543210"
                        className={formErrors.phoneNumber ? 'error' : ''}
                      />
                      {formErrors.phoneNumber && <span className="error-message">{formErrors.phoneNumber}</span>}
                    </div>
                    
                    <div className={`form-group full-width ${formErrors.addressLine1 ? 'error' : ''}`}>
                      <label htmlFor="addressLine1">Address Line 1</label>
                      <input
                        type="text"
                        id="addressLine1"
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleChange}
                        placeholder="Street address, P.O. box, company name"
                        className={formErrors.addressLine1 ? 'error' : ''}
                      />
                      {formErrors.addressLine1 && <span className="error-message">{formErrors.addressLine1}</span>}
                    </div>
                    
                    <div className="form-group full-width">
                      <label htmlFor="addressLine2">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        id="addressLine2"
                        name="addressLine2"
                        value={formData.addressLine2}
                        onChange={handleChange}
                        placeholder="Apartment, suite, unit, building, floor, etc."
                      />
                    </div>
                    
                    <div className={`form-group ${formErrors.city ? 'error' : ''}`}>
                      <label htmlFor="city">City</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City"
                        className={formErrors.city ? 'error' : ''}
                      />
                      {formErrors.city && <span className="error-message">{formErrors.city}</span>}
                    </div>
                    
                    <div className={`form-group ${formErrors.state ? 'error' : ''}`}>
                      <label htmlFor="state">State</label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="State"
                        className={formErrors.state ? 'error' : ''}
                      />
                      {formErrors.state && <span className="error-message">{formErrors.state}</span>}
                    </div>
                    
                    <div className={`form-group ${formErrors.postalCode ? 'error' : ''}`}>
                      <label htmlFor="postalCode">Postal Code</label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="Postal Code"
                        className={formErrors.postalCode ? 'error' : ''}
                      />
                      {formErrors.postalCode && <span className="error-message">{formErrors.postalCode}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="country">Country</label>
                      <div className="select-wrapper">
                        <select
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                        >
                          <option value="India">India</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                        </select>
                        <FiChevronDown className="select-arrow" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => navigate('/vendi/cart')}
                    >
                      <FiArrowLeft /> Back to Cart
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleNextStep}
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}
              
              {activeStep === 2 && (
                <div className="form-section">
                  <div className="section-header">
                    <h2><FiCreditCard /> Payment Method</h2>
                  </div>
                  
                  <div className="payment-methods">
                    <div 
                      className={`payment-method ${formData.paymentMethod === 'credit-card' ? 'active' : ''}`}
                      onClick={() => setFormData({...formData, paymentMethod: 'credit-card'})}
                    >
                      <div className="payment-icon">💳</div>
                      <span>Credit/Debit Card</span>
                    </div>
                    
                    <div 
                      className={`payment-method ${formData.paymentMethod === 'upi' ? 'active' : ''}`}
                      onClick={() => setFormData({...formData, paymentMethod: 'upi'})}
                    >
                      <div className="payment-icon">📱</div>
                      <span>UPI</span>
                    </div>
                    
                    <div 
                      className={`payment-method ${formData.paymentMethod === 'netbanking' ? 'active' : ''}`}
                      onClick={() => setFormData({...formData, paymentMethod: 'netbanking'})}
                    >
                      <div className="payment-icon">🏦</div>
                      <span>Net Banking</span>
                    </div>
                    
                    <div 
                      className={`payment-method ${formData.paymentMethod === 'cod' ? 'active' : ''}`}
                      onClick={() => setFormData({...formData, paymentMethod: 'cod'})}
                    >
                      <div className="payment-icon">📦</div>
                      <span>Cash on Delivery</span>
                    </div>
                  </div>
                  
                  {formData.paymentMethod === 'credit-card' && (
                    <div className="payment-form">
                      <div className={`form-group ${formErrors.cardNumber ? 'error' : ''}`}>
                        <label>Card Number</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                        />
                        {formErrors.cardNumber && <span className="error-message">{formErrors.cardNumber}</span>}
                      </div>
                      
                      <div className="form-row">
                        <div className={`form-group ${formErrors.expiryDate ? 'error' : ''}`}>
                          <label>Expiry Date</label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            placeholder="MM/YY"
                            maxLength="5"
                          />
                          {formErrors.expiryDate && <span className="error-message">{formErrors.expiryDate}</span>}
                        </div>
                        
                        <div className={`form-group ${formErrors.cvv ? 'error' : ''}`}>
                          <label>CVV</label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleChange}
                            placeholder="123"
                            maxLength="4"
                          />
                </div>
              )}
              
              {activeStep === 3 && (
                <div className="order-confirmation">
                  <div className="confirmation-icon">
                    <div className="checkmark">✓</div>
                  </div>
                  <h2>Order Confirmed!</h2>
                  <p className="confirmation-text">
                    Thank you for your purchase. Your order has been received and is being processed.
                    You will receive an email confirmation shortly.
                  </p>
                  <div className="order-details">
                    <div className="detail-row">
                      <span>Order Number:</span>
                      <span>#MC{Math.floor(100000 + Math.random() * 900000)}</span>
                    </div>
                    <div className="detail-row">
                      <span>Date:</span>
                      <span>{new Date().toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="detail-row">
                      <span>Total:</span>
                      <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="detail-row">
                      <span>Payment Method:</span>
                      <span>{formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
                    </div>
                  </div>
                  
                  <div className="confirmation-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate('/vendi/orders')}
                    >
                      View Order Status
                    </button>
                    <button 
                      className="btn btn-outline"
                      onClick={() => navigate('/vendi/products')}
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
          
          {/* Order Summary Sidebar */}
          <div className="checkout-sidebar">
            <div className="order-summary">
              <h3>Order Summary</h3>
              
              <div className="order-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="order-item">
                    <div className="item-image">
                      <img 
                        src={item.image_url || 'https://via.placeholder.com/80'} 
                        alt={item.name} 
                        loading="lazy"
                      />
                      <span className="item-quantity">{item.quantity}</span>
                    </div>
                    <div className="item-details">
                      <h4 className="item-name">{item.name}</h4>
                      <div className="item-price">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        {item.original_price > item.price && (
                          <span className="original-price">
                            ₹{item.original_price.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="order-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`}</span>
                </div>
                <div className="total-row">
                  <span>Tax (GST 18%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="total-row grand-total">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              </div>
              
              {activeStep === 1 && (
                <div className="order-actions">
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleNextStep}
                  >
                    Continue to Payment
                  </button>
                </div>
              )}
              
              {activeStep === 2 && (
                <div className="order-actions">
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : 'Place Order'}
                  </button>
                  <p className="secure-checkout">
                    <FiLock /> Secure SSL Encryption
                  </p>
                </div>
              )}
            </div>
            
            <div className="need-help">
              <h4>Need Help?</h4>
              <p>Have questions about your order?</p>
              <a href="/contact" className="help-link">Contact our support team</a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
export default Checkout;
