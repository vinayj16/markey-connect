import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import MainLayout from '../layout/MainLayout';
import './ProductDiscovery.css';

const ProductDiscovery = () => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    interests: [],
    frequency: 'weekly'
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        interests: checked 
          ? [...prev.interests, value]
          : prev.interests.filter(interest => interest !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <MainLayout userType="customer" pageTitle="Newsletter Subscription" showSearchBar={false}>
      <div className={`newsletter-container ${isDark ? 'dark-theme' : ''}`}>
        <div className="newsletter-content">
          <div className="section-header">
            <h1>Almost there!</h1>
            <p className="subtitle">
              Complete your subscription to receive exclusive deals, product updates,
              and special offers
            </p>
          </div>

          <div className="card-box">
            <h4>📬 Subscription Preferences</h4>
            <p>Customize your newsletter experience</p>
          </div>

          <form className="newsletter-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Your first name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Your last name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-section">
              <h4>Interests</h4>
              <p>Select categories you're interested in:</p>
              <div className="checkbox-group">
                {['Electronics', 'Home & Kitchen', 'Fashion', 'Health & Beauty'].map((interest) => (
                  <label key={interest} className="checkbox-label">
                    <input
                      type="checkbox"
                      value={interest.toLowerCase()}
                      checked={formData.interests.includes(interest.toLowerCase())}
                      onChange={handleInputChange}
                    />
                    <span>{interest}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h4>Email Frequency</h4>
              <div className="radio-group">
                {[
                  { value: 'weekly', label: 'Weekly Digest' },
                  { value: 'flash', label: 'Flash Sales' },
                  { value: 'new', label: 'New Arrivals' }
                ].map(({ value, label }) => (
                  <label key={value} className="radio-label">
                    <input
                      type="radio"
                      name="frequency"
                      value={value}
                      checked={formData.frequency === value}
                      onChange={handleInputChange}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <p className="privacy">
              By subscribing, you agree to our Privacy Policy and consent to receive
              marketing emails. You can unsubscribe anytime.
            </p>

            <div className="action-buttons">
              <button type="submit" className="btn btn-primary">
                Complete Subscription
              </button>
              <button type="button" className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>

          <footer className="newsletter-footer">
            <p>Questions?</p>
            <button className="btn btn-support">Contact Support</button>
          </footer>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductDiscovery;
