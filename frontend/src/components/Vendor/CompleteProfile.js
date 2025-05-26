import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './CompleteProfile.css';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    categories: {
      primary: '',
      secondary: []
    }
  });

  const [images, setImages] = useState({
    logo: null,
    banner: null
  });

  const [previewUrls, setPreviewUrls] = useState({
    logo: null,
    banner: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrls.logo) URL.revokeObjectURL(previewUrls.logo);
      if (previewUrls.banner) URL.revokeObjectURL(previewUrls.banner);
    };
  }, [previewUrls]);

  const validateField = (name, value) => {
    switch (name) {
      case 'businessName':
        return value.trim() ? '' : 'Business name is required';
      case 'description':
        return value.trim().length >= 50 ? '' : 'Description must be at least 50 characters';
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Please enter a valid email address';
      case 'phone':
        return /^\+?[\d\s-]{10,}$/.test(value) ? '' : 'Please enter a valid phone number';
      case 'address.street':
        return value.trim() ? '' : 'Street address is required';
      case 'address.city':
        return value.trim() ? '' : 'City is required';
      case 'address.state':
        return value.trim() ? '' : 'State/Province is required';
      case 'address.postalCode':
        return /^[\d\w\s-]{3,10}$/.test(value) ? '' : 'Please enter a valid postal code';
      case 'address.country':
        return value ? '' : 'Please select a country';
      case 'categories.primary':
        return value ? '' : 'Please select a primary category';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setError(null);
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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
        if (previewUrls.logo) {
          URL.revokeObjectURL(previewUrls.logo);
        }
        setImages(prev => ({ ...prev, logo: file }));
        setPreviewUrls(prev => ({ ...prev, logo: previewUrl }));
      } else {
        if (previewUrls.banner) {
          URL.revokeObjectURL(previewUrls.banner);
        }
        setImages(prev => ({ ...prev, banner: file }));
        setPreviewUrls(prev => ({ ...prev, banner: previewUrl }));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error handling image upload:', err);
      setError('Failed to process image. Please try again.');
    }
  };

  const removeImage = (type) => {
    if (type === 'logo') {
      if (previewUrls.logo) {
        URL.revokeObjectURL(previewUrls.logo);
      }
      setImages(prev => ({ ...prev, logo: null }));
      setPreviewUrls(prev => ({ ...prev, logo: null }));
    } else {
      if (previewUrls.banner) {
        URL.revokeObjectURL(previewUrls.banner);
      }
      setImages(prev => ({ ...prev, banner: null }));
      setPreviewUrls(prev => ({ ...prev, banner: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    Object.keys(formData).forEach(key => {
      if (key === 'address' || key === 'categories') {
        Object.keys(formData[key]).forEach(subKey => {
          const error = validateField(`${key}.${subKey}`, formData[key][subKey]);
          if (error) errors[`${key}.${subKey}`] = error;
        });
      } else {
        const error = validateField(key, formData[key]);
        if (error) errors[key] = error;
      }
    });
    
    if (!images.logo) {
      errors.logo = 'Business logo is required';
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
        if (key === 'address' || key === 'categories') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });
      
      if (images.logo) {
        submitData.append('logo', images.logo);
      }
      
      if (images.banner) {
        submitData.append('banner', images.banner);
      }
      
      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/vendor/profile', {
        method: 'POST',
        body: submitData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save profile');
      }
      
      const data = await response.json();
      setSuccess(true);
      setTimeout(() => {
        navigate('/vendor/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complete-profile-container">
      <h2>Complete Your Profile</h2>
      <nav className="breadcrumb">
        <Link to="/">Home</Link> &gt; <Link to="/vendor">Vendor</Link> &gt; Profile
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
          <p>Profile saved successfully! Redirecting to dashboard...</p>
        </div>
      )}

      <form className="profile-form" onSubmit={handleSubmit}>
        {/* Business Information */}
        <section>
          <h4>Business Information</h4>
          <div>
            <input
              type="text"
              name="businessName"
              className={`form-control ${validationErrors.businessName ? 'error' : ''}`}
              placeholder="Enter your business name"
              value={formData.businessName}
              onChange={handleInputChange}
              disabled={loading}
            />
            {validationErrors.businessName && (
              <span className="field-error">{validationErrors.businessName}</span>
            )}
          </div>

          <div>
            <textarea
              name="description"
              className={`form-control ${validationErrors.description ? 'error' : ''}`}
              placeholder="Describe your business in a few sentences (minimum 50 characters)"
              rows="3"
              value={formData.description}
              onChange={handleInputChange}
              disabled={loading}
            />
            {validationErrors.description && (
              <span className="field-error">{validationErrors.description}</span>
            )}
          </div>

          <div>
            <input
              type="email"
              name="email"
              className={`form-control ${validationErrors.email ? 'error' : ''}`}
              placeholder="contact@yourbusiness.com"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
            />
            {validationErrors.email && (
              <span className="field-error">{validationErrors.email}</span>
            )}
          </div>

          <div>
            <input
              type="tel"
              name="phone"
              className={`form-control ${validationErrors.phone ? 'error' : ''}`}
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={loading}
            />
            {validationErrors.phone && (
              <span className="field-error">{validationErrors.phone}</span>
            )}
          </div>
        </section>

        {/* Business Address */}
        <section>
          <h4>Business Address</h4>
          <div>
            <input
              type="text"
              name="address.street"
              className={`form-control ${validationErrors['address.street'] ? 'error' : ''}`}
              placeholder="123 Main Street"
              value={formData.address.street}
              onChange={handleInputChange}
              disabled={loading}
            />
            {validationErrors['address.street'] && (
              <span className="field-error">{validationErrors['address.street']}</span>
            )}
          </div>

          <div>
            <input
              type="text"
              name="address.city"
              className={`form-control ${validationErrors['address.city'] ? 'error' : ''}`}
              placeholder="Enter city"
              value={formData.address.city}
              onChange={handleInputChange}
              disabled={loading}
            />
            {validationErrors['address.city'] && (
              <span className="field-error">{validationErrors['address.city']}</span>
            )}
          </div>

          <div>
            <input
              type="text"
              name="address.state"
              className={`form-control ${validationErrors['address.state'] ? 'error' : ''}`}
              placeholder="Enter state or province"
              value={formData.address.state}
              onChange={handleInputChange}
              disabled={loading}
            />
            {validationErrors['address.state'] && (
              <span className="field-error">{validationErrors['address.state']}</span>
            )}
          </div>

          <div>
            <input
              type="text"
              name="address.postalCode"
              className={`form-control ${validationErrors['address.postalCode'] ? 'error' : ''}`}
              placeholder="Enter postal code"
              value={formData.address.postalCode}
              onChange={handleInputChange}
              disabled={loading}
            />
            {validationErrors['address.postalCode'] && (
              <span className="field-error">{validationErrors['address.postalCode']}</span>
            )}
          </div>

          <div>
            <select
              name="address.country"
              className={`form-control ${validationErrors['address.country'] ? 'error' : ''}`}
              value={formData.address.country}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="">Select country</option>
              <option value="US">United States</option>
              <option value="IN">India</option>
              <option value="CA">Canada</option>
              <option value="UK">United Kingdom</option>
              <option value="AU">Australia</option>
            </select>
            {validationErrors['address.country'] && (
              <span className="field-error">{validationErrors['address.country']}</span>
            )}
          </div>
        </section>

        {/* Brand Assets */}
        <section className="brand-assets">
          <h4>Brand Assets</h4>
          <div className="asset-box">
            <label>📎 Business Logo</label>
            <p>Upload a square logo (min 400×400px)</p>
            {previewUrls.logo ? (
              <div className="image-preview">
                <img src={previewUrls.logo} alt="Logo preview" />
                <button
                  type="button"
                  className="remove-image"
                  onClick={() => removeImage('logo')}
                  aria-label="Remove logo"
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
            {validationErrors.logo && (
              <span className="field-error">{validationErrors.logo}</span>
            )}
          </div>

          <div className="asset-box">
            <label>🖼️ Store Banner</label>
            <p>Upload a banner image (1200×300px)</p>
            {previewUrls.banner ? (
              <div className="image-preview">
                <img src={previewUrls.banner} alt="Banner preview" />
                <button
                  type="button"
                  className="remove-image"
                  onClick={() => removeImage('banner')}
                  aria-label="Remove banner"
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

        {/* Business Categories */}
        <section>
          <h4>Business Categories</h4>
          <div>
            <select
              name="categories.primary"
              className={`form-control ${validationErrors['categories.primary'] ? 'error' : ''}`}
              value={formData.categories.primary}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="">Select primary category</option>
              <option value="fashion">Fashion</option>
              <option value="electronics">Electronics</option>
              <option value="home">Home & Garden</option>
              <option value="beauty">Beauty & Personal Care</option>
              <option value="sports">Sports & Outdoors</option>
            </select>
            {validationErrors['categories.primary'] && (
              <span className="field-error">{validationErrors['categories.primary']}</span>
            )}
          </div>

          <div>
            <select
              name="categories.secondary"
              className="form-control"
              multiple
              value={formData.categories.secondary}
              onChange={(e) => {
                const options = Array.from(e.target.selectedOptions, option => option.value);
                setFormData(prev => ({
                  ...prev,
                  categories: {
                    ...prev.categories,
                    secondary: options
                  }
                }));
              }}
              disabled={loading}
            >
              <option value="shoes">Shoes</option>
              <option value="watches">Watches</option>
              <option value="jewelry">Jewelry</option>
              <option value="accessories">Accessories</option>
              <option value="bags">Bags & Wallets</option>
            </select>
            <p className="help-text">Hold Ctrl/Cmd to select multiple categories</p>
          </div>
        </section>

        {/* Action Buttons */}
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
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompleteProfile;
