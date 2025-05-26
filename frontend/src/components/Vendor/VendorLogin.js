import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './VendorLogin.css';

const VendorLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/vendors/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('vendorToken', result.token);
        localStorage.setItem('vendorInfo', JSON.stringify(result.vendor));
        navigate('/vendor/dashboard');
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    setError(null);

    try {
      // Implement social login logic here
      console.log(`Social login with ${provider}`);
      setError('Social login not implemented yet');
    } catch (err) {
      console.error('Social login error:', err);
      setError('Social login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
        <Link to="/">Home</Link> &gt; <Link to="/vendor">Vendor</Link> &gt; Login
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

      <div className="login-box">
        <h1>Vendor Login</h1>
        <p className="subtitle">
          Access your vendor dashboard to manage products and track sales
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email Address</label>
          <div className="input-group">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleInputChange}
              required
              aria-label="Email address"
            />
            <span className="icon" aria-hidden="true">@</span>
          </div>

          <label htmlFor="password">Password</label>
          <div className="input-group">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
              aria-label="Password"
            />
            <button
              type="button"
              className="icon"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <div className="forgot">
            <Link to="/vendor/forgot-password">Forgot password?</Link>
          </div>

          <button 
            className="btn-primary" 
            type="submit"
            disabled={isLoading}
            aria-label="Login to vendor account"
          >
            Login
          </button>
        </form>

        <div className="or">Or continue with</div>

        <div className="social-buttons">
          <button 
            className="social-btn"
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
            aria-label="Login with Google"
          >
            <span>G</span> Google
          </button>
          <button 
            className="social-btn"
            onClick={() => handleSocialLogin('facebook')}
            disabled={isLoading}
            aria-label="Login with Facebook"
          >
            <span>f</span> Facebook
          </button>
        </div>

        <div className="register-links">
          <p>Don't have an account?</p>
          <Link to="/vendor/register">
            <button 
              className="btn-outline"
              disabled={isLoading}
              aria-label="Register as a new vendor"
            >
              Register as Vendor
            </button>
          </Link>
          <Link to="/vendor">
            <button 
              className="btn-secondary"
              disabled={isLoading}
              aria-label="Return to vendor portal"
            >
              Back
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VendorLogin;
