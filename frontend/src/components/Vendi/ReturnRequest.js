import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import MainLayout from '../layout/MainLayout';
import './ReturnRequest.css'; // Ensure you have a corresponding CSS file for styling

const ReturnRequest = () => {
  const { isDark } = useTheme();
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnReason, setReturnReason] = useState('');
  const [returnMethod, setReturnMethod] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');

  const handleItemSelect = (itemName, price, quantity) => {
    const item = { name: itemName, price, quantity };
    setSelectedItems((prevItems) =>
      prevItems.some((i) => i.name === itemName)
        ? prevItems.map((i) => (i.name === itemName ? item : i))
        : [...prevItems, item]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Return Request Submitted:', {
      items: selectedItems,
      reason: returnReason,
      method: returnMethod,
      details: additionalDetails,
    });
  };

  const sampleItems = [
    { name: 'Product Name 1', price: 19.99, quantity: 2 },
    { name: 'Product Name 2', price: 29.99, quantity: 1 },
  ];

  const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = 5.0;
  const restockingFee = 3.0;
  const estimatedRefund = total - shippingFee - restockingFee;

  return (
    <MainLayout userType="customer" pageTitle="Return Request" showSearchBar={false}>
      <div className={`return-request-container ${isDark ? 'dark-theme' : ''}`}>
        <div className="return-header">
          <h1>Return Request</h1>
          <p className="return-date">Date: Oct 2023-10-08</p>
          <p className="return-policy">
            Return Policy: Items can be returned within 30 days of delivery. 
            Shipping costs for returns may apply based on the reason for return.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="return-form">
          <div className="form-section">
            <h2>Select Items to Return</h2>
            <div className="items-list">
              {sampleItems.map((item, index) => (
                <div key={index} className="item-selection">
                  <input
                    type="checkbox"
                    id={`item-${index}`}
                    onChange={() => handleItemSelect(item.name, item.price, item.quantity)}
                    className="item-checkbox"
                  />
                  <label htmlFor={`item-${index}`} className="item-label">
                    <span className="item-name">{item.name}</span>
                    <span className="item-details">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h2>Return Reason</h2>
            <div className="form-group">
              <select 
                value={returnReason} 
                onChange={(e) => setReturnReason(e.target.value)} 
                required
                className="return-select"
              >
                <option value="">Select reason for return</option>
                <option value="Defective">Defective</option>
                <option value="Not as described">Not as described</option>
                <option value="Changed mind">Changed mind</option>
              </select>
              <textarea
                placeholder="Additional details"
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                rows="4"
                className="return-textarea"
              ></textarea>
            </div>
          </div>

          <div className="form-section">
            <h2>Return Method</h2>
            <div className="return-method">
              <label className="method-label">
                <input
                  type="radio"
                  name="returnMethod"
                  value="Ship Back"
                  checked={returnMethod === 'Ship Back'}
                  onChange={() => setReturnMethod('Ship Back')}
                  className="method-radio"
                />
                <span>Ship Back</span>
              </label>
              <label className="method-label">
                <input
                  type="radio"
                  name="returnMethod"
                  value="Drop-off"
                  checked={returnMethod === 'Drop-off'}
                  onChange={() => setReturnMethod('Drop-off')}
                  className="method-radio"
                />
                <span>Drop-off</span>
              </label>
            </div>
          </div>

          <div className="form-section">
            <h2>Return Summary</h2>
            <div className="return-summary">
              <div className="summary-row">
                <span>Item Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Return Shipping Fee</span>
                <span>${shippingFee.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Restocking Fee</span>
                <span>${restockingFee.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Estimated Refund</span>
                <span>${estimatedRefund.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Submit Return Request
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default ReturnRequest;
