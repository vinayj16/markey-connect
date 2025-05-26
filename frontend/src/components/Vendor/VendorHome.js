import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './VendorHome.css'; // Ensure you have a corresponding CSS file

const VendorHome = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const vendorToken = localStorage.getItem('vendorToken');
        if (vendorToken) {
          // Verify token validity here if needed
          navigate('/vendor/dashboard');
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError('Failed to verify authentication status');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleNavigation = async (path) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await navigate(path);
    } catch (err) {
      setError(`Failed to navigate to ${path}`);
      console.error('Navigation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterClick = () => handleNavigation('/vendor/register');
  const handleLoginClick = () => handleNavigation('/vendor/login');
  const handleHomeClick = () => handleNavigation('/');

  if (isLoading) {
    return (
      <div className="vendor-container loading">
        <div className="loading-spinner" aria-label="Loading"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="vendor-container">
      <nav className="navbar" role="navigation">
        <Link to="/" className="logo" aria-label="MarketConnect Home">MarketConnect</Link>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
      </nav>

      <div className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link> &gt; Vendor
      </div>

      {error && (
        <div className="error-message" role="alert">
          <span>⚠️</span> {error}
          <button 
            className="retry-btn"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="vendor-header">
        <h1>Vendor Portal</h1>
        <p>Join our marketplace as a vendor or access your existing account</p>
      </div>

      <div className="vendor-options">
        <div className="vendor-card">
          <h3>New Vendor</h3>
          <p>Register your business, get a digital ID card, and start listing your products</p>
          <button 
            onClick={handleRegisterClick}
            disabled={isLoading}
            aria-label="Register as a new vendor"
          >
            Register as Vendor
          </button>
        </div>
        <div className="vendor-card">
          <h3>Existing Vendor</h3>
          <p>Access your vendor dashboard to manage products and view sales</p>
          <button 
            onClick={handleLoginClick}
            disabled={isLoading}
            aria-label="Login as an existing vendor"
          >
            Login as Vendor
          </button>
        </div>
      </div>

      <div className="vendor-benefits">
        <h2>Vendor Benefits</h2>
        <ul>
          <li>
            <strong>Digital ID Card</strong>
            Get a QR-coded ID for your business
          </li>
          <li>
            <strong>Product Management</strong>
            Easy listing and inventory tracking
          </li>
          <li>
            <strong>Sales Analytics</strong>
            Track performance and customer insights
          </li>
          <li>
            <strong>Multiple Sales Channels</strong>
            Sell online and in physical locations
          </li>
        </ul>
      </div>

      <div className="how-it-works">
        <h2>How It Works</h2>
        <button 
          onClick={handleHomeClick}
          disabled={isLoading}
          aria-label="Return to home page"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default VendorHome;
