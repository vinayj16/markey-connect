import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileUpdate.css'; // Ensure you have a corresponding CSS file for styling

const ProfileUpdate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '',
    businessDescription: '',
    businessEmail: '',
    businessPhone: '',
    streetAddress: '',
    city: '',
    stateProvince: '',
    postalZipCode: '',
    country: '',
    businessLogo: null,
    storeBanner: null,
    primaryCategory: '',
    secondaryCategories: [],
  });

  const [previewUrls, setPreviewUrls] = useState({
    businessLogo: null,
    storeBanner: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrls.businessLogo) URL.revokeObjectURL(previewUrls.businessLogo);
      if (previewUrls.storeBanner) URL.revokeObjectURL(previewUrls.storeBanner);
    };
  }, [previewUrls]);

  const validateField = (name, value) => {
    switch (name) {
      case 'businessName':
        return value.trim() ? '' : 'Business name is required';
      case 'businessDescription':
        return value.trim().length >= 50 ? '' : 'Description must be at least 50 characters';
      case 'businessEmail':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Please enter a valid email address';
      case 'businessPhone':
        return /^\+?[\d\s-]{10,}$/.test(value) ? '' : 'Please enter a valid phone number';
      case 'streetAddress':
        return value.trim() ? '' : 'Street address is required';
      case 'city':
        return value.trim() ? '' : 'City is required';
      case 'stateProvince':
        return value.trim() ? '' : 'State/Province is required';
      case 'postalZipCode':
        return /^[\d\w\s-]{3,10}$/.test(value) ? '' : 'Please enter a valid postal code';
      case 'country':
        return value ? '' : 'Please select a country';
      case 'primaryCategory':
        return value ? '' : 'Please select a primary category';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    
    const error = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      const previewUrl = URL.createObjectURL(file);
      
      if (type === 'logo') {
        if (previewUrls.businessLogo) {
          URL.revokeObjectURL(previewUrls.businessLogo);
        }
        setFormData(prev => ({ ...prev, businessLogo: file }));
        setPreviewUrls(prev => ({ ...prev, businessLogo: previewUrl }));
      } else {
        if (previewUrls.storeBanner) {
          URL.revokeObjectURL(previewUrls.storeBanner);
        }
        setFormData(prev => ({ ...prev, storeBanner: file }));
        setPreviewUrls(prev => ({ ...prev, storeBanner: previewUrl }));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error handling image upload:', err);
      setError('Failed to process image. Please try again.');
    }
  };

  const removeImage = (type) => {
    if (type === 'logo') {
      if (previewUrls.businessLogo) {
        URL.revokeObjectURL(previewUrls.businessLogo);
      }
      setFormData(prev => ({ ...prev, businessLogo: null }));
      setPreviewUrls(prev => ({ ...prev, businessLogo: null }));
    } else {
      if (previewUrls.storeBanner) {
        URL.revokeObjectURL(previewUrls.storeBanner);
      }
      setFormData(prev => ({ ...prev, storeBanner: null }));
      setPreviewUrls(prev => ({ ...prev, storeBanner: null }));
    }
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      secondaryCategories: checked
        ? [...prev.secondaryCategories, value]
        : prev.secondaryCategories.filter(category => category !== value)
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    Object.keys(formData).forEach(key => {
      if (key !== 'secondaryCategories' && key !== 'businessLogo' && key !== 'storeBanner') {
        const error = validateField(key, formData[key]);
        if (error) errors[key] = error;
      }
    });
    
    if (!formData.businessLogo) {
      errors.businessLogo = 'Business logo is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    if (!validateForm()) {
      setError('Please fix the validation errors before submitting');
      return;
    }
    
    setLoading(true);
    
    try {
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'secondaryCategories') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'businessLogo' || key === 'storeBanner') {
          if (formData[key]) {
            submitData.append(key, formData[key]);
          }
        } else {
          submitData.append(key, formData[key]);
        }
      });
      
      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/vendor/profile', {
        method: 'PUT',
        body: submitData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/vendor/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-update-container">
      <h1>Update Your Profile</h1>
      <nav className="breadcrumb">
        <a href="/">Home</a> &gt; <a href="/vendor">Vendor</a> &gt; Profile Update
      </nav>

      {error && (
        <div className="error-message">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="success-message">
          <span>✅</span>
          <p>Profile updated successfully! Redirecting to dashboard...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <section className="business-information">
          <h2>Business Information</h2>
          <div className="form-group">
            <label htmlFor="businessName">Business Name</label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              className={validationErrors.businessName ? 'error' : ''}
              disabled={loading}
              required
            />
            {validationErrors.businessName && (
              <span className="field-error">{validationErrors.businessName}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="businessDescription">Business Description</label>
            <textarea
              id="businessDescription"
              name="businessDescription"
              value={formData.businessDescription}
              onChange={handleChange}
              className={validationErrors.businessDescription ? 'error' : ''}
              rows="3"
              disabled={loading}
              required
            />
            {validationErrors.businessDescription && (
              <span className="field-error">{validationErrors.businessDescription}</span>
            )}
          </div>
        </section>

        <section className="contact-information">
          <h2>Contact Information</h2>
          <div className="form-group">
            <label htmlFor="businessEmail">Business Email</label>
            <input
              type="email"
              id="businessEmail"
              name="businessEmail"
              value={formData.businessEmail}
              onChange={handleChange}
              className={validationErrors.businessEmail ? 'error' : ''}
              disabled={loading}
              required
            />
            {validationErrors.businessEmail && (
              <span className="field-error">{validationErrors.businessEmail}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="businessPhone">Business Phone</label>
            <input
              type="tel"
              id="businessPhone"
              name="businessPhone"
              value={formData.businessPhone}
              onChange={handleChange}
              className={validationErrors.businessPhone ? 'error' : ''}
              disabled={loading}
              required
            />
            {validationErrors.businessPhone && (
              <span className="field-error">{validationErrors.businessPhone}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="streetAddress">Street Address</label>
            <input
              type="text"
              id="streetAddress"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleChange}
              className={validationErrors.streetAddress ? 'error' : ''}
              disabled={loading}
              required
            />
            {validationErrors.streetAddress && (
              <span className="field-error">{validationErrors.streetAddress}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={validationErrors.city ? 'error' : ''}
              disabled={loading}
              required
            />
            {validationErrors.city && (
              <span className="field-error">{validationErrors.city}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="stateProvince">State/Province</label>
            <input
              type="text"
              id="stateProvince"
              name="stateProvince"
              value={formData.stateProvince}
              onChange={handleChange}
              className={validationErrors.stateProvince ? 'error' : ''}
              disabled={loading}
              required
            />
            {validationErrors.stateProvince && (
              <span className="field-error">{validationErrors.stateProvince}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="postalZipCode">Postal/ZIP Code</label>
            <input
              type="text"
              id="postalZipCode"
              name="postalZipCode"
              value={formData.postalZipCode}
              onChange={handleChange}
              className={validationErrors.postalZipCode ? 'error' : ''}
              disabled={loading}
              required
            />
            {validationErrors.postalZipCode && (
              <span className="field-error">{validationErrors.postalZipCode}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="country">Country</label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={validationErrors.country ? 'error' : ''}
              disabled={loading}
              required
            >
              <option value="">Select country</option>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="UK">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="IN">India</option>
            </select>
            {validationErrors.country && (
              <span className="field-error">{validationErrors.country}</span>
            )}
          </div>
        </section>

        <section className="brand-assets">
          <h2>Brand Assets</h2>
          <div className="asset-box">
            <label>Business Logo</label>
            <p>Upload a square logo (min 400×400px)</p>
            {previewUrls.businessLogo ? (
              <div className="image-preview">
                <img src={previewUrls.businessLogo} alt="Logo preview" />
                <button
                  type="button"
                  className="remove-image"
                  onClick={() => removeImage('logo')}
                  disabled={loading}
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="upload-button">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'logo')}
                  style={{ display: 'none' }}
                  disabled={loading}
                />
                Upload Logo
              </label>
            )}
            {validationErrors.businessLogo && (
              <span className="field-error">{validationErrors.businessLogo}</span>
            )}
          </div>

          <div className="asset-box">
            <label>Store Banner</label>
            <p>Upload a banner image (1200×300px)</p>
            {previewUrls.storeBanner ? (
              <div className="image-preview">
                <img src={previewUrls.storeBanner} alt="Banner preview" />
                <button
                  type="button"
                  className="remove-image"
                  onClick={() => removeImage('banner')}
                  disabled={loading}
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="upload-button">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'banner')}
                  style={{ display: 'none' }}
                  disabled={loading}
                />
                Upload Banner
              </label>
            )}
          </div>
        </section>

        <section className="business-categories">
          <h2>Business Categories</h2>
          <div className="form-group">
            <label htmlFor="primaryCategory">Primary Category</label>
            <select
              id="primaryCategory"
              name="primaryCategory"
              value={formData.primaryCategory}
              onChange={handleChange}
              className={validationErrors.primaryCategory ? 'error' : ''}
              disabled={loading}
              required
            >
              <option value="">Select primary category</option>
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Home & Garden">Home & Garden</option>
              <option value="Beauty">Beauty</option>
              <option value="Food">Food</option>
            </select>
            {validationErrors.primaryCategory && (
              <span className="field-error">{validationErrors.primaryCategory}</span>
            )}
          </div>
          <div className="form-group">
            <label>Secondary Categories (Optional)</label>
            <div className="checkbox-group">
              {['Electronics', 'Fashion', 'Home & Garden', 'Beauty', 'Food'].map(category => (
                <label key={category} className="checkbox-label">
                  <input
                    type="checkbox"
                    value={category}
                    checked={formData.secondaryCategories.includes(category)}
                    onChange={handleCategoryChange}
                    disabled={loading}
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/vendor/dashboard')}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="save-btn"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileUpdate;
