import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import './VendorRegister.css';

const VendorRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    businessType: '',
    description: '',
    termsAccepted: false
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    const requiredFields = ['businessName', 'email', 'password', 'confirmPassword', 'phone', 'address', 'city', 'state', 'zipCode', 'businessType'];
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Phone validation
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // ZIP code validation
    if (formData.zipCode && !/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code';
    }

    // Terms acceptance
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await vendorAPI.register({
        businessName: formData.businessName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        businessType: formData.businessType,
        description: formData.description
      });

      if (response.data) {
        toast.success('Registration successful! Please log in.');
        navigate('/vendor/login');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-header">
        <h1>Vendor Registration</h1>
        <p>Create your vendor account to start selling on our platform</p>
      </div>

      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Business Information</h2>
        <div className="form-group">
          <label htmlFor="businessName">Business Name *</label>
          <input
            type="text"
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            placeholder="Enter your business name"
            required
          />
          {errors.businessName && <span className="error-message">{errors.businessName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            required
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            required
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password *</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
          />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            required
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>

        <h2>Business Location</h2>
        <div className="form-group">
          <label htmlFor="address">Street Address *</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your street address"
            required
          />
          {errors.address && <span className="error-message">{errors.address}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="city">City *</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter your city"
            required
          />
          {errors.city && <span className="error-message">{errors.city}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="state">State *</label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="Enter your state"
            required
          />
          {errors.state && <span className="error-message">{errors.state}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="zipCode">ZIP Code *</label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            placeholder="Enter your ZIP code"
            required
          />
          {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
        </div>

        <h2>Business Details</h2>
        <div className="form-group">
          <label htmlFor="businessType">Business Type *</label>
          <select
            id="businessType"
            name="businessType"
            value={formData.businessType}
            onChange={handleChange}
            required
          >
            <option value="">Select business type</option>
            <option value="retail">Retail</option>
            <option value="wholesale">Wholesale</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="service">Service</option>
            <option value="other">Other</option>
          </select>
          {errors.businessType && <span className="error-message">{errors.businessType}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Business Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your business"
            rows="4"
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        <div className="terms">
          <input
            type="checkbox"
            id="termsAccepted"
            name="termsAccepted"
            checked={formData.termsAccepted}
            onChange={handleChange}
            required
          />
          <label htmlFor="termsAccepted">
            I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>
          </label>
          {errors.termsAccepted && <span className="error-message">{errors.termsAccepted}</span>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>

        <div className="login-link">
          <p>Already have an account?</p>
          <a href="/vendor/login" className="login-link-button">Log in here</a>
        </div>
      </form>
    </div>
  );
};

export default VendorRegister;
