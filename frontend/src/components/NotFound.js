import React, { useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  // Handle keyboard navigation
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Escape') {
      navigate(-1);
    }
  }, [navigate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Handle quick link click
  const handleQuickLinkClick = useCallback((e) => {
    e.currentTarget.blur();
  }, []);

  return (
    <MainLayout userType="guest" showContainer={true} pageTitle="Page Not Found">
      <div className="not-found-container" role="main">
        <div className="not-found-content">
          <div 
            className="not-found-icon" 
            role="img" 
            aria-label="404 Error"
            tabIndex="0"
          >
            404
          </div>
          <h1>Oops! Page Not Found</h1>
          <p>
            The page you are looking for might have been removed, had its name changed, 
            or is temporarily unavailable.
          </p>
          
          <div className="not-found-actions">
            <Link 
              to="/" 
              className="btn btn-primary"
              aria-label="Go to Homepage"
              onClick={handleQuickLinkClick}
            >
              <span className="btn-icon" aria-hidden="true">🏠</span> 
              Go to Homepage
            </Link>
            <Link 
              to="/vendi/products/all" 
              className="btn btn-outline"
              aria-label="Browse Products"
              onClick={handleQuickLinkClick}
            >
              <span className="btn-icon" aria-hidden="true">🛍️</span> 
              Browse Products
            </Link>
          </div>
          
          <div className="not-found-help">
            <h3>Looking for something specific?</h3>
            <ul className="quick-links" role="list">
              <li>
                <Link 
                  to="/vendi/products/all" 
                  aria-label="View all products"
                  onClick={handleQuickLinkClick}
                >
                  <span aria-hidden="true">🔍</span>
                  All Products
                </Link>
              </li>
              <li>
                <Link 
                  to="/vendor/register" 
                  aria-label="Register as a vendor"
                  onClick={handleQuickLinkClick}
                >
                  <span aria-hidden="true">🏪</span>
                  Become a Vendor
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  aria-label="Contact support"
                  onClick={handleQuickLinkClick}
                >
                  <span aria-hidden="true">📞</span>
                  Contact Support
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  aria-label="Learn about MarketConnect"
                  onClick={handleQuickLinkClick}
                >
                  <span aria-hidden="true">ℹ️</span>
                  About MarketConnect
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;