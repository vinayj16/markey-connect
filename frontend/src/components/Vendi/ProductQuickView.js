// src/components/Vendi/ProductQuickView.js
import React from 'react';
import { FiX } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import './ProductQuickView.css';

const ProductQuickView = ({ product, onClose }) => {
  const { isDark } = useTheme();

  const handleAddToCart = () => {
    // Handle add to cart logic
    console.log('Adding to cart:', product);
  };

  const handleViewProduct = () => {
    // Handle view product logic
    console.log('Viewing product:', product);
  };

  return (
    <div className="quick-view-overlay" onClick={onClose}>
      <div 
        className={`quick-view-modal ${isDark ? 'dark-theme' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <button 
          className="quick-view-close" 
          onClick={onClose}
          aria-label="Close quick view"
        >
          <FiX />
        </button>

        <div className="quick-view-content">
          <div className="quick-view-image">
            <img 
              src={product.image_url || 'https://via.placeholder.com/400x400'} 
              alt={product.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/400x400';
              }}
            />
          </div>

          <div className="quick-view-info">
            <h2 className="product-title">{product.name}</h2>

            <div className="quick-view-price">
              <span className="current-price">
                ${parseFloat(product.price).toFixed(2)}
              </span>
              {product.original_price && (
                <span className="original-price">
                  ${parseFloat(product.original_price).toFixed(2)}
                </span>
              )}
              {product.discount_percentage > 0 && (
                <span className="discount-badge">
                  -{product.discount_percentage}%
                </span>
              )}
            </div>

            {product.rating > 0 && (
              <div className="quick-view-ratings">
                <div className="rating-stars">
                  {[...Array(5)].map((_, index) => (
                    <span 
                      key={index}
                      className={`star ${index < Math.floor(product.rating) ? 'filled' : ''}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="rating-value">{product.rating.toFixed(1)}</span>
                <span className="review-count">
                  ({product.review_count || 0} reviews)
                </span>
              </div>
            )}

            <div className="quick-view-description">
              <h3>Description</h3>
              <p>{product.description || 'No description available.'}</p>
            </div>

            {product.features && (
              <div className="product-features">
                <h3>Features</h3>
                <ul>
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="quick-view-actions">
              <button 
                className="btn btn-primary"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleViewProduct}
              >
                View Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView;