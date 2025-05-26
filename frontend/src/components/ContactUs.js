import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ContactUs.css';

function ContactUs() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // TODO: Implement actual form submission
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setErrors({});
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-container">
      {/* Navbar */}
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

      {/* Header */}
      <header className="section header">
        <h1>Get in Touch</h1>
        <p>
          Have questions about MarketConnect? Our team is here to help you with any inquiries or support needs.
        </p>
      </header>

      {/* Support Sections */}
      <section className="support-cards">
        <div className="support-card">
          <h3>🔔 Customer Support</h3>
          <p>For general inquiries and customer assistance</p>
          <div className="button-group">
            <button 
              className="btn primary" 
              onClick={() => navigate('/email-support')}
              aria-label="Contact email support"
            >
              Email Support
            </button>
            <button 
              className="btn secondary"
              onClick={() => window.location.href = 'tel:+1234567890'}
              aria-label="Call customer support"
            >
              Call Us
            </button>
          </div>
        </div>

        <div className="support-card">
          <h3>🛠️ Technical Help</h3>
          <p>For platform issues and technical assistance</p>
          <div className="button-group">
            <button 
              className="btn primary"
              onClick={() => navigate('/submit-ticket')}
              aria-label="Submit a technical support ticket"
            >
              Submit a Ticket
            </button>
            <button 
              className="btn secondary"
              onClick={() => navigate('/faq')}
              aria-label="View frequently asked questions"
            >
              View FAQ
            </button>
          </div>
        </div>
      </section>

      {/* Message Form */}
      <section className="section message-form">
        <h2>Send Us a Message</h2>
        <form onSubmit={handleSubmit} noValidate>
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
              placeholder="What is your message about?"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              aria-label="Message subject"
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
              placeholder="Type your message here..."
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

          {submitStatus === 'success' && (
            <div className="success-message" role="alert">
              <span>✓</span> Message sent successfully!
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="error-message" role="alert">
              <span>✕</span> Failed to send message. Please try again.
            </div>
          )}

          <button 
            type="submit" 
            className="btn submit"
            disabled={isSubmitting}
            aria-label={isSubmitting ? 'Sending message...' : 'Send message'}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </section>

      {/* Locations */}
      <section className="section locations">
        <h2>Office Locations</h2>
        <div className="location-grid">
          <div className="location-card">
            <h4>📍 New York</h4>
            <p>123 Market St, NY 10001</p>
          </div>
          <div className="location-card">
            <h4>📍 San Francisco</h4>
            <p>456 Tech Ave, CA 94107</p>
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="section socials">
        <h4>Follow Us</h4>
        <div className="social-links">
          <button 
            className="btn social"
            onClick={() => window.open('https://twitter.com/marketconnect', '_blank')}
            aria-label="Follow us on Twitter"
          >
            Twitter
          </button>
          <button 
            className="btn social"
            onClick={() => window.open('https://linkedin.com/company/marketconnect', '_blank')}
            aria-label="Follow us on LinkedIn"
          >
            LinkedIn
          </button>
          <button 
            className="btn social"
            onClick={() => window.open('https://facebook.com/marketconnect', '_blank')}
            aria-label="Follow us on Facebook"
          >
            Facebook
          </button>
        </div>
      </section>
    </div>
  );
}

export default ContactUs;
