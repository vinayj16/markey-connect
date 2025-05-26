import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import MainLayout from '../layout/MainLayout';
import "./ProfileSettings.css";

const ProfileSettings = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    fullName: 'Jane Cooper',
    email: 'jane.cooper@example.com',
    phone: '+1 (555) 123-4567',
    street: '123 Main Street',
    city: 'San Francisco',
    state: 'California',
    postalCode: '94105',
    country: 'United States',
    emailNotifications: true,
    smsNotifications: false,
    language: 'English'
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle file upload
      console.log('File to upload:', file);
    }
  };

  const handleRemoveImage = () => {
    // Handle image removal
    console.log('Removing profile image');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <>
            <div className="section">
              <h3>Personal Information</h3>
              <div className="input-grid">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    className="input-style"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="input-style"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="input-style"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="section">
              <h3>Address Information</h3>
              <div className="input-grid">
                <div className="form-group">
                  <label htmlFor="street">Street Address</label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    className="input-style"
                    value={formData.street}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    className="input-style"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State/Province</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    className="input-style"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="postalCode">Postal Code</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    className="input-style"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    className="input-style"
                    value={formData.country}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="section">
              <h3>Profile Picture</h3>
              <div className="profile-section">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2"
                  alt="Profile"
                  className="profile-img"
                />
                <div className="upload-box">
                  <p><strong>Upload New Picture</strong></p>
                  <p>JPG, PNG or GIF. 1MB max size.</p>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                  <div className="btn-group">
                    <button className="btn btn-primary">Upload</button>
                    <button 
                      className="btn btn-secondary"
                      onClick={handleRemoveImage}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      case 'preferences':
        return (
          <div className="section">
            <h3>Account Preferences</h3>
            <div className="preferences">
              <div className="preference-item">
                <label htmlFor="emailNotifications">Email Notifications</label>
                <input
                  type="checkbox"
                  id="emailNotifications"
                  name="emailNotifications"
                  checked={formData.emailNotifications}
                  onChange={handleInputChange}
                />
              </div>
              <div className="preference-item">
                <label htmlFor="smsNotifications">SMS Notifications</label>
                <input
                  type="checkbox"
                  id="smsNotifications"
                  name="smsNotifications"
                  checked={formData.smsNotifications}
                  onChange={handleInputChange}
                />
              </div>
              <div className="preference-item">
                <label htmlFor="language">Language</label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout userType="customer" pageTitle="Account Settings" showSearchBar={false}>
      <div className={`account-settings-container ${isDark ? 'dark-theme' : ''}`}>
        <div className="settings-wrapper">
          <p className="breadcrumb">Home &gt; Settings</p>
          <h2 className="settings-title">Account Settings</h2>
          <p className="settings-subtitle">
            Manage your account preferences and information
          </p>

          <div className="nav-tabs">
            {['profile', 'security', 'notifications', 'payment', 'preferences'].map(tab => (
              <span
                key={tab}
                className={activeTab === tab ? 'active' : ''}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </span>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {renderTabContent()}

            <div className="action-buttons">
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
              <button type="button" className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfileSettings;
