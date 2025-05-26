import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // TODO: Implement newsletter subscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setEmail('');
    } catch (error) {
      setSubmitStatus('error');
      console.error('Error subscribing to newsletter:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [email]);

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">About MarketConnect</h3>
            <p className="footer-description">
              Your one-stop marketplace for all your needs. We connect buyers and sellers
              in a seamless, secure, and efficient way.
            </p>
            <div className="footer-social" aria-label="Social media links">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-social-link"
                aria-label="Visit our Facebook page"
              >
                <i className="fab fa-facebook" aria-hidden="true"></i>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-social-link"
                aria-label="Visit our Twitter page"
              >
                <i className="fab fa-twitter" aria-hidden="true"></i>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-social-link"
                aria-label="Visit our Instagram page"
              >
                <i className="fab fa-instagram" aria-hidden="true"></i>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-social-link"
                aria-label="Visit our LinkedIn page"
              >
                <i className="fab fa-linkedin" aria-hidden="true"></i>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li>
                <Link to="/about" aria-label="Learn more about us">About Us</Link>
              </li>
              <li>
                <Link to="/contact" aria-label="Contact our support team">Contact Us</Link>
              </li>
              <li>
                <Link to="/faq" aria-label="View frequently asked questions">FAQ</Link>
              </li>
              <li>
                <Link to="/terms" aria-label="Read our terms and conditions">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/privacy" aria-label="Read our privacy policy">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Categories</h3>
            <ul className="footer-links">
              <li>
                <Link to="/categories/electronics" aria-label="Browse electronics">Electronics</Link>
              </li>
              <li>
                <Link to="/categories/fashion" aria-label="Browse fashion">Fashion</Link>
              </li>
              <li>
                <Link to="/categories/home" aria-label="Browse home and living">Home & Living</Link>
              </li>
              <li>
                <Link to="/categories/beauty" aria-label="Browse beauty and health">Beauty & Health</Link>
              </li>
              <li>
                <Link to="/categories/sports" aria-label="Browse sports and outdoors">Sports & Outdoors</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Newsletter</h3>
            <p className="footer-description">
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            <form 
              className="footer-newsletter" 
              onSubmit={handleSubmit}
              aria-label="Newsletter subscription form"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="footer-newsletter-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Your email address"
                aria-invalid={submitStatus === 'error'}
                aria-describedby={submitStatus === 'error' ? 'newsletter-error' : undefined}
              />
              <button 
                type="submit" 
                className="footer-newsletter-button"
                disabled={isSubmitting}
                aria-label={isSubmitting ? 'Subscribing...' : 'Subscribe to newsletter'}
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            {submitStatus === 'success' && (
              <p className="success-message" role="alert">
                ✓ Thank you for subscribing!
              </p>
            )}
            {submitStatus === 'error' && (
              <p id="newsletter-error" className="error-message" role="alert">
                ✕ Failed to subscribe. Please try again.
              </p>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            © {currentYear} MarketConnect. All rights reserved.
          </div>
          <div className="footer-payment">
            <span className="footer-payment-text">We Accept:</span>
            <div className="footer-payment-methods" aria-label="Accepted payment methods">
              <i className="fab fa-cc-visa" aria-hidden="true" title="Visa"></i>
              <i className="fab fa-cc-mastercard" aria-hidden="true" title="Mastercard"></i>
              <i className="fab fa-cc-amex" aria-hidden="true" title="American Express"></i>
              <i className="fab fa-cc-paypal" aria-hidden="true" title="PayPal"></i>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 