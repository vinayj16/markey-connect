import React, { useState } from 'react';
import { customerAPI } from '../../utils/api';
import { useTheme } from '../../contexts/ThemeContext';
import './newslettersubscription.css';

const NewsletterSubscription = () => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid email address'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await customerAPI.subscribeToNewsletter(email);
      
      setStatus({
        type: 'success',
        message: 'Thank you for subscribing to our newsletter!'
      });
      setEmail('');
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setStatus({
        type: 'error',
        message: 'Failed to subscribe. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (status.message) {
      setStatus({ type: '', message: '' });
    }
  };

  return (
    <section className={`newsletter-section ${isDark ? 'dark-theme' : ''}`}>
      <h2>Stay Updated</h2>
      <p>
        Subscribe to our newsletter for exclusive deals, new product alerts, and shopping tips.
      </p>

      <form className="newsletter-form" onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="Enter your email address"
          disabled={isSubmitting}
          aria-label="Email address for newsletter subscription"
          className={isDark ? 'dark-input' : ''}
        />
        <button 
          type="submit" 
          disabled={isSubmitting}
          aria-label="Subscribe to newsletter"
          className={isDark ? 'dark-button' : ''}
        >
          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>

      {status.message && (
        <div className={`newsletter-success ${status.type} ${isDark ? 'dark-theme' : ''}`}>
          {status.message}
        </div>
      )}
    </section>
  );
};

export default NewsletterSubscription; 