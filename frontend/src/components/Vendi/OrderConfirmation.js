import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import MainLayout from '../layout/MainLayout';
import './OrderConfirmation.css'; // Ensure you have a corresponding CSS file for styling

const OrderConfirmation = () => {
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get order data from navigation state
  const orderData = location.state?.orderData || {
    orderId: 'MC-2023-45678',
    orderDate: new Date().toLocaleDateString(),
    orderTime: new Date().toLocaleTimeString(),
    status: 'being prepared for shipment',
    items: [
      { name: 'Product Name 1', price: 19.99, quantity: 2 },
      { name: 'Product Name 2', price: 29.99, quantity: 1 },
    ],
    timeline: [
      { event: 'Order Received', date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() },
      { event: 'Processing', date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() },
      { event: 'Shipping', date: 'Estimated: ' + new Date(Date.now() + 86400000).toLocaleDateString(), time: '' },
      { event: 'Delivery', date: 'Estimated: ' + new Date(Date.now() + 259200000).toLocaleDateString(), time: '' },
    ],
    shippingAddress: '123 Main Street, Apt 4B, New York, NY 10001',
    paymentMethod: 'Visa ending in 4342',
    subtotal: 89.97,
    shipping: 0.00,
    tax: 8.08,
    total: 98.05,
  };

  const handleViewOrderStatus = () => {
    navigate(`/vendi/tracking/${orderData.orderId}`);
  };

  const handleContinueShopping = () => {
    navigate('/vendi/products');
  };

  const handleContactSupport = () => {
    navigate('/support/email');
  };

  const handleReturnItems = () => {
    navigate('/vendi/return-request');
  };

  return (
    <MainLayout userType="customer" pageTitle="Order Confirmation" showSearchBar={false}>
      <div className={`order-confirmation-container ${isDark ? 'dark-theme' : ''}`}>
        <h1>Order Confirmation</h1>

        <div className="order-details">
          <div className="order-header">
            <h2>Order #{orderData.orderId}</h2>
            <p>Updated: {orderData.orderDate} - {orderData.orderTime}</p>
          </div>

          <div className="order-status">
            <h3>Order Status</h3>
            <p className="status-text">{orderData.status}</p>
          </div>

          <div className="order-summary">
            <h3>Items Ordered</h3>
            <ul>
              {orderData.items.map((item, index) => (
                <li key={index} className="order-item">
                  <span className="item-name">{item.name}</span>
                  <span className="item-details">
                    ${item.price.toFixed(2)} × {item.quantity}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="order-timeline">
            <h3>Order Timeline</h3>
            <ul className="timeline-list">
              {orderData.timeline.map((event, index) => (
                <li key={index} className="timeline-item">
                  <div className="timeline-content">
                    <span className="event-name">{event.event}</span>
                    <span className="event-date">
                      {event.date} {event.time && `- ${event.time}`}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="address-payment">
            <div className="shipping-address">
              <h3>Shipping Address</h3>
              <p>{orderData.shippingAddress}</p>
            </div>
            <div className="payment-method">
              <h3>Payment Method</h3>
              <p>{orderData.paymentMethod}</p>
              <button className="view-details" onClick={() => navigate('/vendi/payment-details')}>
                View Details
              </button>
            </div>
          </div>

          <div className="order-summary-section">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${orderData.subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>${orderData.shipping.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <span>${orderData.tax.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${orderData.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="support-section">
            <h3>Need Help?</h3>
            <div className="support-buttons">
              <button className="contact-support" onClick={handleContactSupport}>
                Contact Support
              </button>
              <button className="return-items" onClick={handleReturnItems}>
                Return Items
              </button>
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn-primary" onClick={handleViewOrderStatus}>
              View Order Status
            </button>
            <button className="btn-outline" onClick={handleContinueShopping}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderConfirmation;
