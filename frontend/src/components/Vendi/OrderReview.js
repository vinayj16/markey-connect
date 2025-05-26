import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import MainLayout from '../layout/MainLayout';
import './OrderReview.css'; // Ensure you have a corresponding CSS file for styling

const OrderReview = () => {
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Get order data from navigation state or use default
  const orderDetails = location.state?.orderData || {
    items: [
      { name: 'Wireless Headphones', price: 99.99, quantity: 1 },
      { name: 'Phone Case', price: 19.99, quantity: 1 },
      { name: 'USB-C Cable', price: 12.99, quantity: 1 },
    ],
    shippingAddress: '123 Main Street, Apt 4B, New York, NY 10001',
    shippingMethod: 'Standard Shipping - Estimated delivery ' + new Date(Date.now() + 172800000).toLocaleDateString(),
    paymentMethod: 'Visa ending in 4342',
    subtotal: 132.97,
    tax: 12.03,
    total: 145.00,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Here you would typically make an API call to submit the order
      // const response = await orderAPI.submitOrder({
      //   ...orderDetails,
      //   specialInstructions
      // });
      
      // Navigate to order confirmation with order data
      navigate('/vendi/order-confirmation', {
        state: {
          orderData: {
            ...orderDetails,
            orderId: 'MC-' + Math.floor(100000 + Math.random() * 900000),
            orderDate: new Date().toLocaleDateString(),
            orderTime: new Date().toLocaleTimeString(),
            status: 'being prepared for shipment',
            timeline: [
              { event: 'Order Received', date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() },
              { event: 'Processing', date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() },
              { event: 'Shipping', date: 'Estimated: ' + new Date(Date.now() + 86400000).toLocaleDateString(), time: '' },
              { event: 'Delivery', date: 'Estimated: ' + new Date(Date.now() + 259200000).toLocaleDateString(), time: '' },
            ],
          }
        }
      });
    } catch (error) {
      console.error('Error submitting order:', error);
      // Handle error appropriately
    }
  };

  const handleChangeShipping = () => {
    navigate('/vendi/checkout', { state: { step: 'shipping' } });
  };

  const handleChangePayment = () => {
    navigate('/vendi/checkout', { state: { step: 'payment' } });
  };

  return (
    <MainLayout userType="customer" pageTitle="Review Order" showSearchBar={false}>
      <div className={`order-review-container ${isDark ? 'dark-theme' : ''}`}>
        <h1>Review Your Order</h1>

        <form onSubmit={handleSubmit} className="order-review-form">
          <div className="order-details">
            <h2>Order Details</h2>
            <ul>
              {orderDetails.items.map((item, index) => (
                <li key={index} className="order-item">
                  <span className="item-name">{item.name}</span>
                  <span className="item-details">
                    ${item.price.toFixed(2)} × {item.quantity}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="shipping-information">
            <h2>Shipping Information</h2>
            <div className="shipping-address">
              <h3>Shipping Address</h3>
              <p>{orderDetails.shippingAddress}</p>
              <button type="button" className="change-btn" onClick={handleChangeShipping}>
                Change Address
              </button>
            </div>
            <div className="shipping-method">
              <h3>Shipping Method</h3>
              <p>{orderDetails.shippingMethod}</p>
              <button type="button" className="change-btn" onClick={handleChangeShipping}>
                Change Method
              </button>
            </div>
          </div>

          <div className="payment-information">
            <h2>Payment Information</h2>
            <div className="payment-method">
              <h3>Payment Method</h3>
              <p>{orderDetails.paymentMethod}</p>
              <button type="button" className="change-btn" onClick={handleChangePayment}>
                Change Payment
              </button>
            </div>
          </div>

          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${orderDetails.subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <span>${orderDetails.tax.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${orderDetails.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="additional-information">
            <h2>Additional Information</h2>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Enter any special instructions for delivery"
              rows="4"
              className="special-instructions"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={() => navigate('/vendi/checkout')}>
              Back to Checkout
            </button>
            <button type="submit" className="btn-primary">
              Place Order
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default OrderReview;
