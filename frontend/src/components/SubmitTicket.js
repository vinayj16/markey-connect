import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import './SubmitTicket.css';
import { useDispatch } from 'react-redux';
import { addNotification } from '../store/slices/uiSlice';

const SubmitTicket = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    issueType: '',
    priority: 'medium',
    description: '',
    steps: '',
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          file: 'File size should be less than 5MB'
        }));
        return;
      }
      setFile(selectedFile);
      setErrors(prev => ({
        ...prev,
        file: ''
      }));
    }
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.issueType) newErrors.issueType = 'Issue type is required';
    if (!formData.priority) newErrors.priority = 'Priority level is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (validateForm()) {
      // TODO: Implement actual ticket submission logic
      console.log('Form submitted:', { ...formData, file });
      dispatch(addNotification({
        type: 'success',
        message: 'Ticket submitted successfully!',
      }));
      navigate('/ticket-success');
    }
  }, [formData, file, validateForm, navigate, dispatch]);

  const handleCancel = useCallback(() => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <MainLayout userType="guest" showContainer={true} pageTitle="Submit Support Ticket">
      <div className="ticket-container">
        <nav className="navbar" role="navigation">
          <div className="logo" role="banner">MarketConnect</div>
          <ul className="nav-links" role="list">
            <li role="listitem">
              <Link to="/" aria-label="Go to Home">🏠 Home</Link>
            </li>
            <li role="listitem">
              <Link to="/about" aria-label="Learn about us">ℹ️ About</Link>
            </li>
            <li className="active" role="listitem">
              <Link to="/contact" aria-label="Contact us">📧 Contact</Link>
            </li>
          </ul>
          <button 
            className="back-btn" 
            onClick={() => navigate(-1)}
            aria-label="Go back to previous page"
          >
            Back
          </button>
        </nav>

        <div className="breadcrumb" role="navigation" aria-label="Breadcrumb">
          <Link to="/">Home</Link> &gt; 
          <Link to="/contact">Contact</Link> &gt; 
          <span aria-current="page">Submit Ticket</span>
        </div>

        <h1>Submit Technical Support Ticket</h1>
        <p className="subtitle">
          Please provide details about your technical issue so our team can assist you promptly.
        </p>

        <form className="ticket-form" onSubmit={handleSubmit} noValidate>
          <section>
            <h2>Ticket Information</h2>
            <div className="form-group">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
                aria-label="Full name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && <span id="name-error" className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                required
                aria-label="Email address"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && <span id="email-error" className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number (Optional)"
                aria-label="Phone number"
              />
            </div>
          </section>

          <section>
            <h2>Issue Details</h2>
            <div className="form-group">
              <select
                name="issueType"
                value={formData.issueType}
                onChange={handleInputChange}
                required
                aria-label="Issue type"
                aria-invalid={!!errors.issueType}
                aria-describedby={errors.issueType ? 'issue-type-error' : undefined}
              >
                <option value="">Select issue type</option>
                <option value="login">Login Issue</option>
                <option value="bug">Bug/Error</option>
                <option value="performance">Performance</option>
                <option value="other">Other</option>
              </select>
              {errors.issueType && <span id="issue-type-error" className="error-message">{errors.issueType}</span>}
            </div>

            <div className="form-group">
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                required
                aria-label="Priority level"
                aria-invalid={!!errors.priority}
                aria-describedby={errors.priority ? 'priority-error' : undefined}
              >
                <option value="">Select priority level</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              {errors.priority && <span id="priority-error" className="error-message">{errors.priority}</span>}
            </div>

            <div className="form-group">
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the issue"
                required
                aria-label="Issue description"
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? 'description-error' : undefined}
              />
              {errors.description && <span id="description-error" className="error-message">{errors.description}</span>}
            </div>

            <div className="form-group">
              <textarea
                name="steps"
                value={formData.steps}
                onChange={handleInputChange}
                placeholder="List the steps to reproduce this issue"
                rows="3"
                aria-label="Steps to reproduce"
              />
            </div>

            <div className="form-group">
              <label className="file-upload">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                  aria-label="Upload files"
                  aria-invalid={!!errors.file}
                  aria-describedby={errors.file ? 'file-error' : undefined}
                />
                <span>Upload Screenshots or Files</span>
                {file && <span className="file-name">{file.name}</span>}
              </label>
              {errors.file && <span id="file-error" className="error-message">{errors.file}</span>}
            </div>
          </section>

          <div className="form-actions">
            <Link
              to="/dashboard"
              className="cancel-btn"
              onClick={handleCancel}
              aria-label="Cancel ticket submission"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="submit-btn"
              aria-label="Submit support ticket"
            >
              Submit Ticket
            </button>
          </div>
        </form>

        <div className="support-box">
          <h3>Need Immediate Help?</h3>
          <p>For urgent issues, you can also reach our support team directly</p>
          <div className="support-buttons">
            <button
              className="chat-btn"
              onClick={() => window.open('/chat', '_blank')}
              aria-label="Start live chat"
            >
              Live Chat
            </button>
            <button
              className="call-btn"
   