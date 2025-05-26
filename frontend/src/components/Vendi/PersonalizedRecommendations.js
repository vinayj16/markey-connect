import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import MainLayout from '../layout/MainLayout';
import { customerAPI } from '../../utils/api';
import { ProductCard } from '../shared';
import './PersonalizedRecommendations.css';

const PersonalizedRecommendations = () => {
  const { isDark } = useTheme();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await customerAPI.getPersonalizedRecommendations();
        setRecommendations(response.data);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Unable to load personalized recommendations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="recommendations-loading">
          <div className="loading-spinner"></div>
          <p>Loading your personalized picks...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="recommendations-error">
          <p>{error}</p>
          <button 
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      );
    }

    if (recommendations.length === 0) {
      return (
        <div className="recommendations-empty">
          <p>No recommendations available at the moment.</p>
          <Link to="/vendi/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      );
    }

    return (
      <>
        <div className="recommendations-grid">
          {recommendations.map(product => (
            <ProductCard
              key={product.id}
              product={{
                ...product,
                image_url: product.image_url,
                discount_percentage: product.discount_percentage || 0,
                is_new: product.is_new || false,
                free_shipping: product.free_shipping || false,
                rating: product.rating || 0,
                review_count: product.review_count || 0,
                original_price: product.original_price || product.price
              }}
            />
          ))}
        </div>

        <div className="recommendations-footer">
          <Link to="/vendi/recommendations" className="btn-primary">
            View All Recommendations
          </Link>
        </div>
      </>
    );
  };

  return (
    <MainLayout userType="customer" pageTitle="Recommended For You" showSearchBar={true}>
      <div className={`personalized-recommendations ${isDark ? 'dark-theme' : ''}`}>
        <div className="section-header">
          <h2>Recommended For You</h2>
          <p className="recommendation-subtitle">
            Based on your browsing history and purchases
          </p>
        </div>
        
        {renderContent()}
      </div>
    </MainLayout>
  );
};

export default PersonalizedRecommendations;