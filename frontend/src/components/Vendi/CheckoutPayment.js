import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { customerAPI, isCustomerLoggedIn } from '../../utils/api';
import MainLayout from '../layout/MainLayout';
import { FiLock, FiCreditCard, FiDollarSign, FiSmartphone, FiBank, FiPackage } from 'react-icons/fi';
import './CheckoutPayment.css';

const CheckoutPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  
  // Order and payment state
  const [orderSummary, setOrderSummary] = useState({
    items: [],
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
  });
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'IN'
    }
  });
  
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'card', name: 'Credit/Debit Card', icon: <FiCreditCard /> },
    { id: 'upi', name: 'UPI', icon: <FiSmartphone /> },
    { id: 'netbanking', name: 'Net Banking', icon: <FiBank /> },
    { id: 'cod', name: 'Cash on Delivery', icon: <FiPackage /> }
  ]);
  
  const [savedCards, setSavedCards] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [selectedCard, setSelectedCard] = useState('');
  const [useNewCard, setUseNewCard] = useState(true);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    saveCard: true
  });
  
  const [billingAddress, setBillingAddress] = useState({
    sameAsShipping: true,
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'IN'
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Check if user is logged in
    if (!isCustomerLoggedIn()) {
      navigate('/vendi/login', { state: { from: '/vendi/checkout/payment' } });
      return;
    }
    
    // Check if shipping info is provided
    checkShippingInfo();
    
    // Fetch payment data
    fetchPaymentData();
  }, [navigate]);

  const checkShippingInfo = async () => {
    try {
      const response = await customerAPI.getCheckoutStatus();
      
      if (!response.data.shippingComplete) {
        navigate('/vendi/checkout');
      }
    } catch (err) {
      console.error('Error checking checkout status:', err);
      navigate('/vendi/checkout');
    }
  };

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      
      // Fetch order summary
      const summaryResponse = await customerAPI.getCheckoutSummary();
      setOrderSummary(summaryResponse.data);
      
      // Fetch payment methods
      const methodsResponse = await customerAPI.getPaymentMethods();
      setPaymentMethods(methodsResponse.data);
      
      if (methodsResponse.data.length > 0) {
        setSelectedPaymentMethod(methodsResponse.data[0].id);
      }
      
      // Fetch saved cards
      const cardsResponse = await customerAPI.getSavedCards();
      setSavedCards(cardsResponse.data);
      
      // If user has saved cards, select the default one
      if (cardsResponse.data.length > 0) {
        const defaultCard = cardsResponse.data.find(card => card.isDefault) || cardsResponse.data[0];
        setSelectedCard(defaultCard.id);
        setUseNewCard(false);
      }
      
      setError('');
    } catch (err) {
      console.error('Error fetching payment data:', err);
      setError('Failed to load payment data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodChange = (e) => {
    setSelectedPaymentMethod(e.target.value);
  };

  const handleCardTypeChange = (e) => {
    setUseNewCard(e.target.value === 'new');
  };

  const handleSavedCardChange = (e) => {
    setSelectedCard(e.target.value);
  };

  const handleCardInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBillingAddressTypeChange = (e) => {
    setBillingAddress(prev => ({
      ...prev,
      sameAsShipping: e.target.value === 'same'
    }));
  };

  const handleBillingInputChange = (e) => {
    const { name, value } = e.target;
    setBillingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!selectedPaymentMethod) {
      errors.paymentMethod = 'Please select a payment method';
    }
    
    if (selectedPaymentMethod === 'credit_card') {
      if (useNewCard) {
        if (!cardDetails.cardNumber.trim()) {
          errors.cardNumber = 'Card number is required';
        } else if (!/^\d{16}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
          errors.cardNumber = 'Please enter a valid 16-digit card number';
        }
        
        if (!cardDetails.cardholderName.trim()) {
          errors.cardholderName = 'Cardholder name is required';
        }
        
        if (!cardDetails.expiryMonth) {
          errors.expiryMonth = 'Expiry month is required';
        }
        
        if (!cardDetails.expiryYear) {
          errors.expiryYear = 'Expiry year is required';
        }
        
        if (!cardDetails.cvv.trim()) {
          errors.cvv = 'CVV is required';
        } else if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
          errors.cvv = 'Please enter a valid CVV';
        }
      } else if (!selectedCard) {
        errors.savedCard = 'Please select a saved card';
      }
      
      if (!billingAddress.sameAsShipping) {
        if (!billingAddress.fullName.trim()) {
          errors.billingName = 'Full name is required';
        }
        
        if (!billingAddress.addressLine1.trim()) {
          errors.billingAddress1 = 'Address is required';
        }
        
        if (!billingAddress.city.trim()) {
          errors.billingCity = 'City is required';
        }
        
        if (!billingAddress.state.trim()) {
          errors.billingState = 'State is required';
        }
        
        if (!billingAddress.postalCode.trim()) {
          errors.billingPostalCode = 'Postal code is required';
        }
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo(0, 0); // Scroll to top to show errors
      return;
    }
    
    try {
      setSubmitting(true);
      
      const paymentData = {
        payment_method_id: selectedPaymentMethod,
        card_details: useNewCard ? cardDetails : { saved_card_id: selectedCard },
        billing_address: billingAddress.sameAsShipping ? 
          { same_as_shipping: true } : 
          { 
            same_as_shipping: false,
            address: {
              full_name: billingAddress.fullName,
              address_line1: billingAddress.addressLine1,
              address_line2: billingAddress.addressLine2,
              city: billingAddress.city,
              state: billingAddress.state,
              postal_code: billingAddress.postalCode,
              country: billingAddress.country
            }
          }
      };
      
      await customerAPI.savePaymentDetails(paymentData);
      
      // Proceed to review step
      navigate('/vendi/checkout/review');
    } catch (err) {
      console.error('Error saving payment details:', err);
      setError(err.response?.data?.message || 'Failed to save payment details. Please try again.');
      setSubmitting(false);
      window.scrollTo(0, 0); // Scroll to top to show error
    }
  };

 if (loading) {
    return (
      <MainLayout userType="customer" pageTitle="Payment Information" showSearchBar={false}>
        <div className="loading-spinner">Loading payment options...</div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout userType="customer" pageTitle="Payment Information" showSearchBar={false}>
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/vendi/checkout" className="btn btn-primary">Return to Shipping</Link>
        </div>
      </MainLayout>
    );
  }

  if (!orderSummary) {
    return (
      <MainLayout userType="customer" pageTitle="Payment Information" showSearchBar={false}>
        <div className="not-found-container">
          <h2>Checkout Session Not Found</h2>
          <p>We couldn't find your checkout session. Please try again.</p>
          <Link to="/vendi/cart" className="btn btn-primary">Return to Cart</Link>
        </div>
      </MainLayout>
    );
  }

  // Generate years for expiry date dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  return (
    <MainLayout userType="customer" pageTitle="Payment - Checkout" showSearchBar={false}>
      <div className="checkout-payment-container">
        <div className="checkout-steps">
          <div className="step completed">
            <div className="step-number">1</div>
            <div className="step-label">Shipping</div>
          </div>
          <div className="step active">
            <div className="step-number">2</div>
            <div className="step-label">Payment</div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-label">Review</div>
          </div>
        </div>

        <h1>Payment Information</h1>
        {error && <div className="error-alert">{error}</div>}

        <div className="checkout-content">
          <div className="checkout-form">
            <form onSubmit={handleSubmit}>
              <div className="payment-methods">
                <h3>Payment Method</h3>
                {formErrors.paymentMethod && <p className="error-message">{formErrors.paymentMethod}</p>}
                
                <div className="payment-options">
                  {paymentMethods.map(method => (
                    <div key={method.id} className="payment-option">
                      <input
                        type="radio"
                        id={`payment-${method.id}`}
                        name="payment-method"
                        value={method.id}
                        checked={selectedPaymentMethod === method.id}
                        onChange={handlePaymentMethodChange}
                        disabled={submitting}
                      />
                      <label htmlFor={`payment-${method.id}`}>
                        <div className="payment-icon">
                          <img src={method.icon_url} alt={method.name} />
                        </div>
                        <span>{method.name}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPaymentMethod === 'credit_card' && (
                <>
                  {savedCards.length > 0 && (
                    <div className="card-selection">
                      <h3>Select Card</h3>
                      <div className="radio-group">
                        <div className="radio-option">
                          <input
                            type="radio"
                            id="saved-card"
                            name="card-type"
                            value="saved"
                            checked={!useNewCard}
                            onChange={handleCardTypeChange}
                            disabled={submitting}
                          />
                          <label htmlFor="saved-card">Use a saved card</label>
                        </div>
                        <div className="radio-option">
                          <input
                            type="radio"
                            id="new-card"
                            name="card-type"
                            value="new"
                            checked={useNewCard}
                            onChange={handleCardTypeChange}
                            disabled={submitting}
                          />
                          <label htmlFor="new-card">Use a new card</label>
                        </div>
                      </div>
                      
                      {!useNewCard && (
                        <div className="saved-cards">
                          {formErrors.savedCard && <p className="error-message">{formErrors.savedCard}</p>}
                          {savedCards.map(card => (
                            <div key={card.id} className="card-item">
                              <input
                                type="radio"
                                id={`card-${card.id}`}
                                name="saved-card"
                                value={card.id}
                                checked={selectedCard === card.id}
                                onChange={handleSavedCardChange}
                                disabled={submitting}
                              />
                              <label htmlFor={`card-${card.id}`}>
                                <div className="card-icon">
                                  <img src={card.card_type_icon} alt={card.card_type} />
                                </div>
                                <div className="card-details">
                                  <p className="card-number">**** **** **** {card.last_four}</p>
                                  <p className="card-expiry">Expires {card.expiry_month}/{card.expiry_year}</p>
                                  <p className="card-name">{card.cardholder_name}</p>
                                </div>
                                {card.isDefault && <span className="default-badge">Default</span>}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {useNewCard && (
                    <div className="card-details-form">
                      <h3>Card Details</h3>
                      
                      <div className="form-group">
                        <label htmlFor="cardNumber">Card Number</label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardDetails.cardNumber}
                          onChange={handleCardInputChange}
                          maxLength="19"
                          disabled={submitting}
                        />
                        {formErrors.cardNumber && <p className="error-message">{formErrors.cardNumber}</p>}
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="cardholderName">Cardholder Name</label>
                        <input
                          type="text"
                          id="cardholderName"
                          name="cardholderName"
                          placeholder="Name as it appears on card"
                          value={cardDetails.cardholderName}
                          onChange={handleCardInputChange}
                          disabled={submitting}
                        />
                        {formErrors.cardholderName && <p className="error-message">{formErrors.cardholderName}</p>}
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="expiryMonth">Expiry Date</label>
                          <div className="expiry-inputs">
                            <select
                              id="expiryMonth"
                              name="expiryMonth"
                              value={cardDetails.expiryMonth}
                              onChange={handleCardInputChange}
                              disabled={submitting}
                            >
                              <option value="">Month</option>
                              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                <option key={month} value={month.toString().padStart(2, '0')}>
                                  {month.toString().padStart(2, '0')}
                                </option>
                              ))}
                            </select>
                            <select
                              id="expiryYear"
                              name="expiryYear"
                              value={cardDetails.expiryYear}
                              onChange={handleCardInputChange}
                              disabled={submitting}
                            >
                              <option value="">Year</option>
                              {years.map(year => (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              ))}
                            </select>
                          </div>
                          {(formErrors.expiryMonth || formErrors.expiryYear) && (
                            <p className="error-message">{formErrors.expiryMonth || formErrors.expiryYear}</p>
                          )}
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="cvv">CVV</label>
                          <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            placeholder="123"
                            value={cardDetails.cvv}
                            onChange={handleCardInputChange}
                            maxLength="4"
                            disabled={submitting}
                          />
                          {formErrors.cvv && <p className="error-message">{formErrors.cvv}</p>}
                        </div>
                      </div>
                      
                      <div className="form-group checkbox-group">
                        <input
                          type="checkbox"
                          id="saveCard"
                          name="saveCard"
                          checked={cardDetails.saveCard}
                          onChange={handleCardInputChange}
                          disabled={submitting}
                        />
                        <label htmlFor="saveCard">Save this card for future purchases</label>
                      </div>
                    </div>
                  )}

                  <div className="billing-address">
                    <h3>Billing Address</h3>
                    
                    <div className="radio-group">
                      <div className="radio-option">
                        <input
                          type="radio"
                          id="same-address"
                          name="billing-address-type"
                          value="same"
                          checked={billingAddress.sameAsShipping}
                          onChange={handleBillingAddressTypeChange}
                          disabled={submitting}
                        />
                        <label htmlFor="same-address">Same as shipping address</label>
                      </div>
                      <div className="radio-option">
                        <input
                          type="radio"
                          id="different-address"
                          name="billing-address-type"
                          value="different"
                          checked={!billingAddress.sameAsShipping}
                          onChange={handleBillingAddressTypeChange}
                          disabled={submitting}
                        />
                        <label htmlFor="different-address">Use a different billing address</label>
                      </div>
                    </div>
                    
                    {!billingAddress.sameAsShipping && (
                      <div className="billing-address-form">
                        <div className="form-group">
                          <label htmlFor="billingFullName">Full Name</label>
                          <input
                            type="text"
                            id="billingFullName"
                            name="fullName"
                            value={billingAddress.fullName}
                            onChange={handleBillingInputChange}
                            disabled={submitting}
                          />
                          {formErrors.billingName && <p className="error-message">{formErrors.billingName}</p>}
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="billingAddressLine1">Address Line 1</label>
                          <input
                            type="text"
                            id="billingAddressLine1"
                            name="addressLine1"
                            value={billingAddress.addressLine1}
                            onChange={handleBillingInputChange}
                            disabled={submitting}
                          />
                          {formErrors.billingAddress1 && <p className="error-message">{formErrors.billingAddress1}</p>}
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="billingAddressLine2">Address Line 2 (Optional)</label>
                          <input
                            type="text"
                            id="billingAddressLine2"
                            name="addressLine2"
                            value={billingAddress.addressLine2}
                            onChange={handleBillingInputChange}
                            disabled={submitting}
                          />
                        </div>
                        
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="billingCity">City</label>
                            <input
                              type="text"
                              id="billingCity"
                              name="city"
                              value={billingAddress.city}
                              onChange={handleBillingInputChange}
                              disabled={submitting}
                            />
                            {formErrors.billingCity && <p className="error-message">{formErrors.billingCity}</p>}
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor="billingState">State/Province</label>
                            <input
                              type="text"
                              id="billingState"
                              name="state"
                              value={billingAddress.state}
                              onChange={handleBillingInputChange}
                              disabled={submitting}
                            />
                            {formErrors.billingState && <p className="error-message">{formErrors.billingState}</p>}
                          </div>
                        </div>
                        
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="billingPostalCode">Postal Code</label>
                            <input
                              type="text"
                              id="billingPostalCode"
                              name="postalCode"
                              value={billingAddress.postalCode}
                              onChange={handleBillingInputChange}
                              disabled={submitting}
                            />
                            {formErrors.billingPostalCode && <p className="error-message">{formErrors.billingPostalCode}</p>}
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor="billingCountry">Country</label>
                            <select
                              id="billingCountry"
                              name="country"
                              value={billingAddress.country}
                              onChange={handleBillingInputChange}
                              disabled={submitting}
                            >
                              <option value="US">United States</option>
                              <option value="CA">Canada</option>
                              <option value="UK">United Kingdom</option>
                              <option value="AU">Australia</option>
                              <option value="IN">India</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {selectedPaymentMethod === 'paypal' && (
                <div className="paypal-info">
                  <p>You will be redirected to PayPal to complete your payment after reviewing your order.</p>
                </div>
              )}

              <div className="form-actions">
                <Link 
                  to="/vendi/checkout" 
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Back to Shipping
                </Link>
<button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : 'Continue to Review'}
                </button>
              </div>
            </form>
          </div>

          <div className="order-summary-sidebar">
            <div className="order-summary-card">
              <h3>Order Summary</h3>
              
              <div className="cart-items-summary">
                <p>{orderSummary.totalItems} items in cart</p>
                <div className="cart-items-list">
                  {orderSummary.items.map(item => (
                    <div key={item.id} className="cart-item-summary">
                      <div className="item-image">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} />
                        ) : (
                          <div className="placeholder-image">No Image</div>
                        )}
                      </div>
                      <div className="item-details">
                        <p className="item-name">{item.name}</p>
                        <p className="item-quantity">Qty: {item.quantity}</p>
                      </div>
                      <p className="item-price">${parseFloat(item.total_price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="price-summary">
                <div className="summary-row">
                  <p>Subtotal</p>
                  <p>${orderSummary.subtotal.toFixed(2)}</p>
                </div>
                <div className="summary-row">
                  <p>Shipping</p>
                  <p>{orderSummary.shipping === 0 ? 'Free' : `$${orderSummary.shipping.toFixed(2)}`}</p>
                </div>
                <div className="summary-row">
                  <p>Estimated Tax</p>
                  <p>${orderSummary.tax.toFixed(2)}</p>
                </div>
                <div className="summary-row total">
                  <p>Total</p>
                  <p>${orderSummary.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div className="secure-checkout-info">
              <div className="secure-icon">🔒</div>
              <p>Secure Checkout</p>
              <p className="secure-text">Your payment information is encrypted and secure.</p>
            </div>
            
            <div className="need-help">
              <h4>Need Help?</h4>
              <p><a href="/vendi/contact">Contact Customer Support</a></p>
              <p><a href="/vendi/faq">Frequently Asked Questions</a></p>
              <p><a href="/vendi/shipping-policy">Shipping Policy</a></p>
              <p><a href="/vendi/returns">Returns & Refunds</a></p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CheckoutPayment;