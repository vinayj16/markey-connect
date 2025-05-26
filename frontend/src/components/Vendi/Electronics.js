// src/components/Vendi/Electronics.js

import React from 'react';
import './Electronics.css';
import MainLayout from '../layout/MainLayout';

const electronicsData = {
  featured: [
    { name: 'Smartphone X12', price: '$799', vendor: 'TechVendor Inc.' },
    { name: 'Smartphone Y10', price: '$599', vendor: 'MobileNet' },
    { name: 'Smartphone Z8', price: '$699', vendor: 'PhoneMates' },
    { name: 'Smartphone A5', price: '$599', vendor: 'TechGadgets' },
  ],
  laptops: [
    { name: 'UltraBook Pro', price: '$1200', vendor: 'TechVendor Inc.' },
    { name: 'Gaming Laptop X', price: '$1499', vendor: 'GameTech' },
    { name: 'Business Laptop', price: '$999', vendor: 'OfficeTech' },
    { name: 'Student Notebook', price: '$749', vendor: 'EduTech' },
  ],
  audio: [
    { name: 'Wireless Earbuds', price: '$129', vendor: 'SoundBeats' },
    { name: 'Noise-Canceling', price: '$229', vendor: 'AudioTech' },
    { name: 'Bluetooth Speaker', price: '$99', vendor: 'SoundWave' },
    { name: 'Smart Speaker', price: '$199', vendor: 'HomeSound' },
  ],
};

const Electronics = () => {
  const renderProducts = (title, products) => (
    <div className="section">
      <h3>{title}</h3>
      <div className="product-grid">
        {products.map((p, index) => (
          <div className="product-card" key={index}>
            <div className="product-icon">📱</div>
            <h4>{p.name}</h4>
            <p>{p.price}</p>
            <span className="vendor">{p.vendor}</span>
            <div className="product-buttons">
              <button className="btn-cart">Add to Cart</button>
              <button className="btn-details">Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="electronics-container">
      <nav className="breadcrumb">Home &gt; Electronics</nav>
      <h2>Electronics</h2>
      <p className="subtitle">Explore our wide range of gadgets, devices, and accessories</p>
      <input type="text" placeholder="Search electronics..." className="search-bar" />

      <div className="categories">
        <button>All Products</button>
        <button>Smartphones</button>
        <button>Laptops</button>
        <button>Audio</button>
        <button>Accessories</button>
      </div>

      {renderProducts('Featured Products', electronicsData.featured)}
      {renderProducts('Laptops & Computers', electronicsData.laptops)}
      {renderProducts('Audio Devices', electronicsData.audio)}

      <div className="vendors">
        <h3>Top Vendors</h3>
        <ul>
          <li>TechVendor Inc. — Premium electronics and gadgets →</li>
          <li>MobileNet — Smartphone specialists →</li>
          <li>AudioTech — Premium audio equipment →</li>
        </ul>
      </div>

      <div className="compare">
        <button>Compare Smartphones</button>
        <button>Compare Laptops</button>
        <button>Compare Audio Devices</button>
      </div>
    </div>
  );
};

export default Electronics;
