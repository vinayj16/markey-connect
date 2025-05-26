// PublishConfirmation.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PublishConfirmation.css';

const PublishConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [publishDate, setPublishDate] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [productData, setProductData] = useState(null);

  useEffect(() => {
    // Get product data from location state or fetch from API
    const fetchProductData = async () => {
      try {
        if (location.state?.productData) {
          setProductData(location.state.productData);
        } else {
          // TODO: Replace with actual API endpoint
          const response = await fetch('/api/vendor/products/draft');
          if (!response.ok) {
            throw new Error('Failed to fetch product data');
          }
          const data = await response.json();
          setProductData(data);
        }
      } catch (err) {
        console.error('Error fetching product data:', err);
        setError('Failed to load product data. Please try again.');
      }
    };

    fetchProductData();
  }, [location.state]);

  const handlePublish = async (isScheduled = false) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/vendor/products/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productData?.id,
          publishDate: isScheduled ? publishDate : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to publish product');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/vendor/products');
      }, 2000);
    } catch (err) {
      console.error('Error publishing product:', err);
      setError(err.message || 'Failed to publish product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = () => {
    setIsScheduled(true);
    // Set minimum date to current time
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); // Minimum 1 minute in the future
    setPublishDate(now.toISOString().slice(0, 16));
  };

  const handleBack = () => {
    navigate('/vendor/products/edit', { state: { productData } });
  };

  const handleDateChange = (e) => {
    setPublishDate(e.target.value);
  };

  if (!productData) {
    return (
      <div className="publish-container">
        <div className="publish-header">
          <h2>Loading...</h2>
          <p>Please wait while we load your product data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="publish-container">
      <div className="publish-header">
        <h2>Publish Confirmation</h2>
        <p>Your product has been added and is ready to be published to the marketplace.</p>
        
        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="success-message">
            <span>✅</span>
            <p>Product published successfully! Redirecting to products page...</p>
          </div>
        )}

        <div className="button-group">
          <button 
            className="btn-primary" 
            onClick={() => handlePublish(false)}
            disabled={loading || isScheduled}
          >
            {loading ? 'Publishing...' : 'Publish Now'}
          </button>
          <button 
            className="btn-outline" 
            onClick={handleSchedule}
            disabled={loading || isScheduled}
          >
            Schedule
          </button>
        </div>
      </div>

      <div className="product-summary">
        <div className="product-image">
          <img 
            src={productData.imageUrl || 'https://via.placeholder.com/300x300'} 
            alt={productData.name || 'Product'} 
          />
        </div>
        <div className="product-info">
          <h3>Product Name</h3>
          <p>{productData.name}</p>

          <h4>Pricing & Inventory</h4>
          <ul>
            <li><strong>Regular Price:</strong> ${productData.regularPrice}</li>
            <li><strong>Sale Price:</strong> ${productData.salePrice}</li>
            <li><strong>Inventory:</strong> {productData.inventory} units</li>
            <li><strong>SKU:</strong> {productData.sku}</li>
          </ul>

          <h4>Categories & Attributes</h4>
          <ul>
            <li><strong>Category:</strong> {productData.category}</li>
            <li><strong>Variations:</strong> {productData.variations}</li>
            <li><strong>Shipping:</strong> {productData.shipping}</li>
          </ul>

          <h4>Visibility Options</h4>
          <ul>
            {productData.isFeatured && <li>✅ Featured Product</li>}
            {productData.isNewArrival && <li>✅ New Arrival</li>}
          </ul>

          <h4>Publishing Options</h4>
          {isScheduled ? (
            <div className="schedule-section">
              <p>Schedule publication</p>
              <input 
                type="datetime-local" 
                value={publishDate}
                onChange={handleDateChange}
                min={new Date().toISOString().slice(0, 16)}
                disabled={loading}
              />
              <div className="schedule-actions">
                <button 
                  className="btn-outline"
                  onClick={() => setIsScheduled(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => handlePublish(true)}
                  disabled={loading || !publishDate}
                >
                  {loading ? 'Scheduling...' : 'Schedule Publish'}
                </button>
              </div>
            </div>
          ) : (
            <p>Click "Schedule" to set a future publication date</p>
          )}
        </div>
      </div>

      <div className="action-buttons">
        <button 
          className="btn-outline"
          onClick={handleBack}
          disabled={loading}
        >
          Back to Edit
        </button>
        <button 
          className="btn-primary"
          onClick={() => handlePublish(false)}
          disabled={loading || isScheduled}
        >
          {loading ? 'Publishing...' : 'Publish Now'}
        </button>
      </div>
    </div>
  );
};

export default PublishConfirmation;
