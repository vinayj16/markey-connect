import React, { useState } from 'react';
import { customerAPI } from '../../utils/api';
import { FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import './StockAlert.css';

const StockAlert = ({ productId, productName, inStock, lowStock }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setLoading(true);
      await customerAPI.createStockAlert(productId, { email });
      setSubmitted(true);
      setError('');
      setShowForm(false);
    } catch (err) {
      console.error('Error creating stock alert:', err);
      setError(err.response?.data?.message || 'Failed to create alert. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (inStock && !lowStock) return null;

  return (
    <div className={`stock-alert ${!inStock ? 'out-of-stock' : 'low-stock'}`}>
      <div className="stock-status">
        <FaExclamationTriangle className="status-icon" />
        <span className="status-text">
          {!inStock ? 'Out of Stock' : 'Low Stock - Order Soon!'}
        </span>
      </div>
      
      {!inStock && (
        <>
          {!submitted ? (
            <>
              <button 
                className="notify-button"
                onClick={() => setShowForm(!showForm)}
                disabled={loading}
              >
                Notify Me When Available
              </button>
              
              {showForm && (
                <form className="stock-alert-form" onSubmit={handleSubmit}>
                  <p>We'll email you when {productName} is back in stock</p>
                  
                  {error && (
                    <div className="alert-error" role="alert">
                      {error}
                    </div>
                  )}
                  
                  <div className="form-input">
                    <input
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={handleEmailChange}
                      disabled={loading}
                      required
                      aria-label="Email address for stock notification"
                    />
                    <button 
                      type="submit"
                      disabled={loading}
                      aria-label="Submit stock alert request"
                    >
                      {loading ? 'Submitting...' : 'Notify Me'}
                    </button>
                  </div>
                  
                  <p className="privacy-note">
                    We'll only use this email to notify you about this product.
                  </p>
                </form>
              )}
            </>
          ) : (
            <div className="alert-success" role="alert">
              <FaCheckCircle className="status-icon" />
              <p>Thank you! We'll email you when this item is back in stock.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StockAlert;