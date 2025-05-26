import React from 'react';
import { Link } from 'react-router-dom';
import './CallToActionCards.css';

const CallToActionCards = () => (
  <section className="cta-cards-section">
    <div className="cta-card">
      <h3>For Vendors</h3>
      <p>List your products and reach more customers</p>
      <Link to="/vendor/register" className="btn btn-secondary btn-sm">Become a Vendor</Link>
    </div>
    <div className="cta-card">
      <h3>For Customers</h3>
      <p>Discover amazing products from trusted vendors.</p>
      <div className="cta-buttons">
        <Link to="/vendi/food" className="btn btn-primary btn-sm">Shop Food</Link>
        <Link to="/products" className="btn btn-secondary btn-sm">Shop All</Link>
      </div>
    </div>
  </section>
);

export default CallToActionCards; 