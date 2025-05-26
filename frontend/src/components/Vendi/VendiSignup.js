import React, { useState } from "react";
import './VendiSignup.css';
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import MainLayout from '../layout/MainLayout';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      setIsLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/customers/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: '', // Optional fields in our schema
        address: ''
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      if (response.status === 201 && response.data.token) {
        localStorage.setItem('customerToken', response.data.token);
        localStorage.setItem('customerInfo', JSON.stringify(response.data.customer));
        
        alert(response.data.message || "Registration successful! You are now logged in.");
        navigate("/vendi/dashboard");
      } else {
        setError(response.data?.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      
      if (err.response) {
        if (err.response.status === 409) {
          setError("This email is already registered. Please use a different email or log in.");
        } else if (err.response.status === 400) {
          setError("Invalid request. Please check your input and try again.");
        } else {
          setError(err.response.data?.error || "An error occurred during registration. Please try again later.");
        }
      } else if (err.request) {
        setError("Unable to connect to the server. Please check your internet connection and try again.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout userType="guest" pageTitle="Create Customer Account">
      <div className="signup-container">
        <div className="card">
          <h2 className="login-title">Join MarketConnect</h2>
          <p className="login-subtitle">Create your account to discover amazing products</p>
          
          <div className="social-login">
            <button type="button" aria-label="Sign up with Google">
              <img src="/images/google.svg" alt="Google" width="24" height="24" />
              Google
            </button>
            <button type="button" aria-label="Sign up with Facebook">
              <img src="/images/facebook.svg" alt="Facebook" width="24" height="24" />
              Facebook
            </button>
          </div>
          
          <div className="separator">or sign up with email</div>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                className="form-control"
                id="name"
                name="name"
                type="text"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                className="form-control"
                id="email"
                name="email"
                type="email"
                placeholder="Your email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                className="form-control"
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                className="form-control"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <div className="remember-me">
                <input 
                  type="checkbox" 
                  id="agreeToTerms" 
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="agreeToTerms">
                  I agree to the <Link to="/terms" className="text-primary">Terms of Service</Link> and <Link to="/privacy" className="text-primary">Privacy Policy</Link>
                </label>
              </div>
            </div>
            
            <button
              className={`btn-primary ${isLoading ? 'loading' : ''}`}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="login-footer">
            <p>Already have an account? <Link to="/vendi/login">Sign In</Link></p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SignupPage;
