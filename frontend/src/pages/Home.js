import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import MainLayout from './layout/MainLayout'; // Using the new Layout component
import Layout from '../components/layout/Layout'; // Using the new Layout component
import ProductCard from '../components/common/ProductCard'; // Using the new ProductCard component
import HeroSection from '../components/home/HeroSection';
import CallToActionCards from '../components/home/CallToActionCards';
import FeaturesSection from '../components/home/FeaturesSection';
import CategoriesSection from '../components/home/CategoriesSection';
import api from '../utils/api'; // Assuming api utility exists
import './Home.css';

// Placeholder components (will be created next)
const HeroSection = () => (
  <section className="hero-section">
    <div className="hero-content">
      <h1 className="hero-title">Welcome to MarketConnect</h1>
      <p className="hero-subtitle">The ultimate marketplace connecting vendors and customers</p>
      <div className="hero-buttons">
        <Link to="/products" className="btn btn-primary btn-lg">
          Shop Now
        </Link>
        <Link to="/vendor/register" className="btn btn-outline btn-lg">
          Become a Vendor
        </Link>
      </div>
    </div>
    <div className="hero-image">
      {/* Placeholder for image or illustration */}
      <img src="/images/hero-image.png" alt="Marketplace" />
    </div>
  </section>
);

const CallToActionCards = () => (
  <section className="cta-cards-section">
    <div className="cta-card">
      <h3>For Vendors</h3>
      <p>List your products and reach more customers</p>
      <Link to="/vendor/register" className="btn btn-secondary btn-sm">Become a Vendor</Link>
    </div>
    <div className="cta-card">
      <h3>For Customers</h3>
      <p>Discover quality products from trusted vendors</p>
      <Link to="/products" className="btn btn-secondary btn-sm">Shop Now</Link>
    </div>
  </section>
);

const FeaturesSection = () => {
  const features = [
    { id: 1, icon: '🔒', title: 'Secure Payments', description: 'All transactions are protected with industry-standard security.' },
    { id: 2, icon: '🛡️', title: 'Quality Assurance', description: 'All vendors are verified to ensure product quality.' },
    { id: 3, icon: '🚚', title: 'Fast Delivery', description: 'Get your products delivered quickly and efficiently.' },
  ];
  return (
    <section className="features-section">
      <h2 className="section-title">Why Choose MarketConnect?</h2>
      <div className="features-grid">
        {features.map(feature => (
          <div key={feature.id} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const CategoriesSection = () => {
  const categories = [
    { id: 1, name: 'Electronics', image: '/images/categories/electronics.jpg' },
    { id: 2, name: 'Home & Kitchen', image: '/images/categories/home-kitchen.jpg' },
    { id: 3, name: 'Fashion', image: '/images/categories/fashion.jpg' },
    { id: 4, name: 'Beauty', image: '/images/categories/beauty.jpg' },
  ];
  return (
    <section className="categories-section">
      <h2 className="section-title">Browse by Category</h2>
      <div className="categories-grid">
        {categories.map(category => (
          <Link key={category.id} to={`/categories/${category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '')}`} className="category-card">
            <div className="category-image">
              <img src={category.image} alt={category.name} />
            </div>
            <h3>{category.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
};


function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/products/featured'); // Assuming this endpoint exists
        setFeaturedProducts(response.data || []);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Failed to load featured products.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);


  return (
    <Layout>
      <div className="home-page">
        <HeroSection />
        <CallToActionCards />
        
        <section className="section featured-products-section">
          <h2 className="section-title">Featured Products</h2>
          {loading ? (
            <div className="loading-spinner"></div> // Use a proper loading spinner class
          ) : error ? (
            <div className="error-message">{error}</div> // Use a proper error message class
          ) : featuredProducts.length > 0 ? (
            <div className="products-grid">
              {featuredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">No featured products available.</div> // Use a proper empty state class
          )}
        </section>

        <FeaturesSection />
        <CategoriesSection />

        {/* Add other sections like Testimonials, Newsletter etc. as needed */}

      </div>
    </Layout>
  );
}

export default Home; 
import React from 'react';
import HeroSection from '../components/home/HeroSection';
import CallToActionCards from '../components/home/CallToActionCards';
import FeaturesSection from '../components/home/FeaturesSection';
import CategoriesSection from '../components/home/CategoriesSection';
import FlashSale from '../components/Vendi/FlashSale';

const Home = () => {
  return (
    <div className="home-page">
      <HeroSection />
      <CallToActionCards />
      <FlashSale />
      <FeaturesSection />
      <CategoriesSection />
    </div>
  );
};

export default Home; 