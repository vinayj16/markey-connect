import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import './Home.css';

function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle testimonial navigation
  const handleTestimonialChange = useCallback((index) => {
    setActiveTestimonial(index);
  }, []);

  const features = [
    {
      id: 1,
      title: 'Discover Products',
      description: 'Browse thousands of quality products across multiple categories.',
      icon: '🛍️',
      link: '/vendi/products/all',
      color: 'var(--primary-color)'
    },
    {
      id: 2,
      title: 'Become a Vendor',
      description: 'Start selling your products and reach thousands of customers.',
      icon: '🏪',
      link: '/vendor/register',
      color: 'var(--accent-color)'
    },
    {
      id: 3,
      title: 'Secure Payments',
      description: 'Safe and secure payment options for all transactions.',
      icon: '🔒',
      link: '/about',
      color: 'var(--success)'
    },
    {
      id: 4,
      title: 'Fast Delivery',
      description: 'Get your products delivered quickly to your doorstep.',
      icon: '🚚',
      link: '/about',
      color: 'var(--warning)'
    }
  ];

  const categories = [
    { id: 1, name: 'All Products', icon: '🛒', link: '/vendi/products/all', color: '#4CAF50' },
    { id: 2, name: 'Home & Garden', icon: '🏡', link: '/vendi/products/home-garden', color: '#4CAF50' },
    { id: 3, name: 'Beauty', icon: '💄', link: '/vendi/products/beauty', color: '#E91E63' },
    { id: 4, name: 'Food', icon: '🍔', link: '/vendi/products/food', color: '#FF9800' },
    { id: 5, name: 'Electronics', icon: '📱', link: '/vendi/products/electronics', color: '#2196F3' },
    { id: 6, name: 'Clothing', icon: '👗', link: '/vendi/products/clothing', color: '#9C27B0' },
    { id: 7, name: 'Sports', icon: '⚽', link: '/vendi/products/sports-outdoor', color: '#00BCD4' }
  ];

  const testimonials = [
    {
      id: 1,
      content: "MarketConnect has transformed my small business. I've reached customers I never thought possible!",
      name: "John Davis",
      role: "Vendor, Organic Foods",
      avatar: "👨‍💼"
    },
    {
      id: 2,
      content: "The variety of products and ease of shopping makes this my go-to marketplace for everything I need.",
      name: "Sarah Miller",
      role: "Customer",
      avatar: "👩‍💼"
    },
    {
      id: 3,
      content: "From registration to sales, the entire process is streamlined. I couldn't be happier with the results.",
      name: "Michael Chen",
      role: "Vendor, Kitchen Supplies",
      avatar: "👨‍🍳"
    }
  ];

  // Handle newsletter form submission
  const handleNewsletterSubmit = useCallback((e) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription logic
    console.log('Newsletter subscription submitted');
  }, []);

  return (
    <MainLayout userType="guest">
      <div className="home-container">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Welcome to MarketConnect</h1>
            <p className="hero-subtitle">The ultimate marketplace connecting vendors and customers</p>
            <div className="hero-buttons">
              <Link to="/vendi/login" className="btn btn-primary btn-lg">
                <span className="btn-icon">🛒</span> Shop Now
              </Link>
              <Link to="/vendor/register" className="btn btn-outline btn-lg">
                <span className="btn-icon">🏪</span> Become a Vendor
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="image-container">
              <div className="image-placeholder">
                <span className="hero-icon">🌐</span>
                <span className="marketplace-text">MarketConnect</span>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section">
          <h2 className="section-title">Why Choose MarketConnect?</h2>
          <div className="features-grid">
            {features.map(feature => (
              <div key={feature.id} className="feature-card" style={{ '--card-accent': feature.color }}>
                <div className="feature-icon" style={{ color: feature.color }}>{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <Link to={feature.link} className="feature-link" style={{ color: feature.color }}>Learn More</Link>
              </div>
            ))}
          </div>
        </section>

        <section className="categories-section">
          <h2 className="section-title">Explore Categories</h2>
          <div className="categories-grid">
            {categories.map(category => (
              <Link key={category.id} to={category.link} className="category-card" style={{ '--category-color': category.color }}>
                <div className="category-icon">{category.icon}</div>
                <h3>{category.name}</h3>
              </Link>
            ))}
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to start selling?</h2>
            <p>Join thousands of vendors already growing their business with MarketConnect.</p>
            <Link to="/vendor/register" className="btn btn-light btn-lg">
              <span className="btn-icon">🚀</span> Register as Vendor
            </Link>
          </div>
        </section>

        <section className="testimonials-section">
          <h2 className="section-title">What Our Users Say</h2>
          <div className="testimonials-slider">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`testimonial-card ${index === activeTestimonial ? 'active' : ''}`}
                style={{ transform: `translateX(${(index - activeTestimonial) * 100}%)` }}
              >
                <div className="testimonial-content">
                  <p>"{testimonial.content}"</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.avatar}</div>
                  <div className="author-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="testimonial-indicators">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === activeTestimonial ? 'active' : ''}`}
                onClick={() => handleTestimonialChange(index)}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </section>

        <section className="newsletter-section">
          <div className="newsletter-container">
            <div className="newsletter-content">
              <h2>Subscribe to our Newsletter</h2>
              <p>Stay updated with new products, promotions, and marketplace news.</p>
              <form className="newsletter-form-main" onSubmit={handleNewsletterSubmit}>
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    required
                    aria-label="Email address"
                  />
                  <button type="submit" className="btn btn-primary">
                    Subscribe <span className="btn-icon">✉️</span>
                  </button>
                </div>
                <div className="form-check">
                  <input type="checkbox" id="consent" required />
                  <label htmlFor="consent">I agree to receive marketing communications from MarketConnect</label>
                </div>
              </form>
            </div>
            <div className="newsletter-image">
              <div className="floating-envelope">
                <span>📨</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

export default Home;
