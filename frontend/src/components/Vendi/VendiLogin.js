import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import MainLayout from '../layout/MainLayout';
import './VendiLogin.css';
import axios from 'axios';

const VendiLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const savedEmail = localStorage.getItem('savedCustomerEmail');
    if (savedEmail) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        rememberMe: true
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/customers/login', {
        email: formData.email,
        password: formData.password,
      });

      if (response.data?.token) {
        localStorage.setItem('customerToken', response.data.token);
        localStorage.setItem('customerInfo', JSON.stringify(response.data.customer));
        
        if (formData.rememberMe) {
          localStorage.setItem('savedCustomerEmail', formData.email);
        } else {
          localStorage.removeItem('savedCustomerEmail');
        }
        
        setSuccess('Login successful! Redirecting...');
        
        setTimeout(() => {
          navigate('/vendi/dashboard');
        }, 1500);
      } else {
        setError(response.data.error || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (platform) => {
    setError(`${platform} login is not implemented yet. Please use email login.`);
  };
  
  return (
    <MainLayout userType="guest" pageTitle="Customer Login">
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">Welcome Back!</h2>
          <p className="login-subtitle">Sign in to access your customer account</p>
          
          <div className="social-login">
            <button 
              type="button" 
              onClick={() => handleSocialLogin('Google')}
              aria-label="Sign in with Google"
            >
              <FaGoogle />
              Google
            </button>
            <button 
              type="button" 
              onClick={() => handleSocialLogin('Facebook')}
              aria-label="Sign in with Facebook"
            >
              <FaFacebook />
              Facebook
            </button>
          </div>
          
          <div className="separator">or sign in with email</div>
          
          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                id="email"
                aria-label="Email address"
              />
              <label className="form-label" htmlFor="email">Email</label>
            </div>

            <div className="form-group">
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  id="password"
                  aria-label="Password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <label className="form-label" htmlFor="password">Password</label>
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input 
                  type="checkbox" 
                  id="rememberMe" 
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  aria-label="Remember me"
                />
                <label htmlFor="rememberMe">Remember Me</label>
              </div>
              <Link to="/vendi/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
            </div>

            <button 
              type="submit" 
              className={`btn-primary ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
              aria-label={isLoading ? "Signing in..." : "Sign in"}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <p>Don't have an account? <Link to="/vendi/signup">Sign Up</Link></p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default VendiLogin;
