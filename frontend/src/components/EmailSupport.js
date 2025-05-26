import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './EmailSupport.css';

function EmailSupport() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderId: '',
    category: '',
    subject: '',
    message: ''
  });
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

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
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
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

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // TODO: Implement actual form submission
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      if (file) {
        formDataToSend.append('file', file);
      }

      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        orderId: '',
        category: '',
        subject: '',
        message: ''
      });
      setFile(null);
      setErrors({});
    } catch (error) {
      setSubmitStatus('error');
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, file, validateForm]);

  const handleLiveChat = useCallback(() => {
    navigate('/live-chat');
  }, [navigate]);

  const handleCallSupport = useCallback(() => {
    window.location.href = 'tel:+18006278253';
  }, []);

  return (
    <div className="email-support-container">
      {/* Breadcrumb & Navigation */}
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <Link to="/" className="logo" aria-label="MarketConnect Home">
          MarketConnect
        </Link>
        <ul className="nav-links">
          <li><Link to="/" aria-label="Go to Home page">🏠 Home</Link></li>
          <li><Link to="/about" aria-label="Go to About page">ℹ️ About</Link></li>
          <li><Link to="/contact" className="active" aria-label="Current page: Contact">📧 Contact</Link></li>
        </ul>
        <button 
          className="back-btn" 
          onClick={() => navigate(-1)}
          aria-label="Go back to previous page"
        >
          Back
        </button>
      </nav>

      <div className="breadcrumb">
        <Link to="/contact">Contact</Link> &gt; Email Support
      </div>

      <h1>Email Customer Support</h1>
      <p className="subtitle">
        Fill out the form below to send an email to our customer support team. We'll respond within 24 hours.
      </p>

      {/* Support Request Card */}
      <div className="support-card">
        <h2>📩 Support Request</h2>
        <p>Our team typically responds within 24 hours on business days</p>

        <form className="support-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter your full name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              aria-label="Your full name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && (
              <span id="name-error" className="error-message" role="alert">
                {errors.name}
              </span>
            )}
          </div>

          <div className="form-group">
            <input
              type="email"
              placeholder="Enter your email address"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              aria-label="Your email address"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && (
              <span id="email-error" className="error-message" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Enter your order number (optional)"
              name="orderId"
              value={formData.orderId}
              onChange={handleInputChange}
              aria-label="Your order number"
            />
          </div>

          <div className="form-group">
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              aria-label="Select a category"
              aria-invalid={!!errors.category}
              aria-describedby={errors.category ? 'category-error' : undefined}
              className={errors.category ? 'error' : ''}
            >
              <option value="">Select a category</option>
              <option value="billing">Billing</option>
              <option value="technical">Technical Support</option>
              <option value="general">General Inquiry</option>
            </select>
            {errors.category && (
              <span id="category-error" className="error-message" role="alert">
                {errors.category}
              </span>
            )}
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Brief description of your issue"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              aria-label="Issue description"
              aria-invalid={!!errors.subject}
              aria-describedby={errors.subject ? 'subject-error' : undefined}
              className={errors.subject ? 'error' : ''}
            />
            {errors.subject && (
              <span id="subject-error" className="error-message" role="alert">
                {errors.subject}
              </span>
            )}
          </div>

          <div className="form-group">
            <textarea
              placeholder="Please provide details about your inquiry or issue..."
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows="5"
              required
              aria-label="Your message"
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? 'message-error' : undefined}
              className={errors.message ? 'error' : ''}
            />
            {errors.message && (
              <span id="message-error" className="error-message" role="alert">
                {errors.message}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="file-upload">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                aria-label="Attach a file"
              />
              <span>Add File</span>
              {file && <span className="file-name">{file.name}</span>}
            </label>
            {errors.file && (
              <span className="error-message" role="alert">
                {errors.file}
              </span>
            )}
          </div>

          {submitStatus === 'success' && (
            <div className="success-message" role="alert">
              <span>✓</span> Support request submitted successfully!
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="error-message" role="alert">
              <span>✕</span> Failed to submit support request. Please try again.
            </div>
          )}

          <button 
            type="submit" 
            className="btn submit"
            disabled={isSubmitting}
            aria-label={isSubmitting ? 'Submitting support request...' : 'Submit support request'}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Support Request'}
          </button>
        </form>
      </div>

      {/* Other Support Options */}
      <section className="other-support">
        <h2>Other Support Options</h2>
        <div className="support-options">
          <div className="option-card">
            <h3>💬 Live Chat</h3>
            <p>Available Mon-Fri, 9am-5pm</p>
            <button 
              className="btn chat"
              onClick={handleLiveChat}
              aria-label="Start live chat support"
            >
              Start Chat
            </button>
          </div>
          <div className="option-card">
            <h3>📞 Call Us</h3>
            <p>1-800-MARKET-CONNECT</p>
            <button 
              className="btn call"
              onClick={handleCallSupport}
              aria-label="Call customer support"
            >
              Call Now
            </button>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <details>
          <summary>📦 How do I track my order?</summary>
          <p>You can track your order using the information in your account dashboard.</p>
        </details>
        <details>
          <summary>🔒 What's your return policy?</summary>
          <p>We offer a 30-day satisfaction guarantee on all products.</p>
        </details>
        <details>
          <summary>🔑 How do I reset my password?</summary>
          <p>Use the "Forgot Password" link on the login page to reset it.</p>
        </details>
      </section>
    </div>
  );
}

export default EmailSupport;
