import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI, customerAPI, isCustomerLoggedIn } from '../../utils/api';
import MainLayout from '../layout/MainLayout';
import { ProductCard } from '../shared';
import PersonalizedRecommendations from './PersonalizedRecommendations';
import FlashSale from './FlashSale';
import CategoryCarousel from './CategoryCarousel';
import ShoppingAssistant from './ShoppingAssistant';
import NewsletterSubscription from './NewsletterSubscription';
import { useTheme } from '../../contexts/ThemeContext';
import './HomePage.css';

const HomePage = () => {
  const { isDark } = useTheme();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userPreferences, setUserPreferences] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const isLoggedIn = isCustomerLoggedIn();

  useEffect(() => {
    const fetchHomePageData = async () => {
      try {
        setLoading(true);
        
        // Fetch multiple data sources in parallel
        const [
          featuredResponse,
          newArrivalsResponse,
          trendingResponse,
          categoriesResponse
        ] = await Promise.all([
          publicAPI.getFeaturedProducts(),
          publicAPI.getNewArrivals(),
          publicAPI.getTrendingProducts(),
          publicAPI.getCategories()
        ]);
        
        setFeaturedProducts(featuredResponse.data);
        setNewArrivals(newArrivalsResponse.data);
        setTrendingProducts(trendingResponse.data);
        setCategories(categoriesResponse.data);
        
        // If user is logged in, fetch their preferences
        if (isLoggedIn) {
          try {
            const preferencesResponse = await customerAPI.getUserPreferences();
            setUserPreferences(preferencesResponse.data);
          } catch (err) {
            console.error('Error fetching user preferences:', err);
            // Non-critical error, don't show to user
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
        setError('Failed to load content. Please refresh the page.');
        setLoading(false);
      }
    };

    fetchHomePageData();
  }, [isLoggedIn]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderProductCard = (product) => (
    <ProductCard 
      key={product.id}
      product={{
        ...product,
        image_url: product.image_url,
        discount_percentage: product.discount_percentage || 0,
        is_new: product.is_new || false,
        free_shipping: product.free_shipping || false,
        rating: product.rating || 0,
        review_count: product.review_count || 0,
        original_price: product.original_price || product.price
      }} 
    />
  );

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.elements.email.value;
    try {
      await publicAPI.subscribeToNewsletter(email);
      alert('Thank you for subscribing to our newsletter!');
      e.target.reset();
    } catch (err) {
      console.error('Error subscribing to newsletter:', err);
      alert('Failed to subscribe. Please try again later.');
    }
  };

  return (
    <MainLayout userType="customer" pageTitle="Welcome to MarketConnect" showSearchBar={true}>
      <div className={`homepage-container ${isDark ? 'dark-theme' : ''}`}>
        {loading ? (
          <div className="loading-spinner">Loading content...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            {/* Hero Banner */}
            <div className="hero-banner">
              <div className="hero-content">
                <h1>Discover Amazing Products</h1>
                <p>Shop the latest trends with confidence</p>
                <Link to="/vendi/products/all" className="shop-now-button">
                  Shop Now
                </Link>
              </div>
            </div>
            
            {/* Flash Sales Section */}
            <section className="homepage-section">
              <FlashSale />
            </section>
            
            {/* Categories Carousel */}
            <section className="homepage-section">
              <div className="section-header">
                <h2>Shop by Category</h2>
                <Link to="/vendi/categories" className="view-all">
                  View All
                </Link>
              </div>
              <CategoryCarousel categories={categories} />
            </section>
            
            {/* Personalized Recommendations (for logged in users) */}
            {isLoggedIn && (
              <section className="homepage-section">
                <PersonalizedRecommendations />
              </section>
            )}
            
            {/* Featured Products */}
            <section className="homepage-section">
              <div className="section-header">
                <h2>Featured Products</h2>
                <Link to="/vendi/featured" className="view-all">
                  View All
                </Link>
              </div>
              
              <div className="products-grid">
                {featuredProducts.slice(0, 4).map(product => renderProductCard(product))}
              </div>
            </section>
            
            {/* New Arrivals */}
            <section className="homepage-section">
              <div className="section-header">
                <h2>New Arrivals</h2>
                <Link to="/vendi/new-arrivals" className="view-all">
                  View All
                </Link>
              </div>
              
              <div className="products-grid">
                {newArrivals.slice(0, 4).map(product => renderProductCard(product))}
              </div>
            </section>
            
            {/* Trending Now */}
            <section className="homepage-section">
              <div className="section-header">
                <h2>Trending Now</h2>
                <Link to="/vendi/trending" className="view-all">
                  View All
                </Link>
              </div>
              
              <div className="products-grid">
                {trendingProducts.slice(0, 4).map(product => renderProductCard(product))}
              </div>
            </section>
            
            {/* User Preferences Based Section (if available) */}
            {userPreferences && userPreferences.favoriteCategory && (
              <section className="homepage-section">
                <div className="section-header">
                  <h2>Picks for You in {userPreferences.favoriteCategory.name}</h2>
                  <Link to={`/vendi/category/${userPreferences.favoriteCategory.id}`} className="view-all">
                    View All
                  </Link>
                </div>
                
                <div className="products-grid">
                  {userPreferences.recommendedProducts.slice(0, 4).map(product => renderProductCard(product))}
                </div>
              </section>
            )}
            
            {/* Promotional Banners */}
            <section className="homepage-section promo-banners">
              <div className="promo-banner">
                <div className="promo-content">
                  <h3>Free Shipping</h3>
                  <p>On orders over $50</p>
                  <Link to="/vendi/shipping-policy" className="promo-link">
                    Learn More
                  </Link>
                </div>
              </div>
              
              <div className="promo-banner">
                <div className="promo-content">
                  <h3>Sustainable Products</h3>
                  <p>Shop eco-friendly</p>
                  <Link to="/vendi/sustainable-products" className="promo-link">
                    Shop Now
                  </Link>
                </div>
              </div>
              
              <div className="promo-banner">
                <div className="promo-content">
                  <h3>Refer a Friend</h3>
                  <p>Get $10 off your next order</p>
                  <Link to="/vendi/referral-program" className="promo-link">
                    Get Started
                  </Link>
                </div>
              </div>
            </section>
            
            {/* Newsletter Signup */}
            <section className="homepage-section">
              <NewsletterSubscription />
            </section>
          </>
        )}
      </div>
      
      {/* AI Shopping Assistant */}
      <ShoppingAssistant />

      {/* Scroll to Top Button */}
      <button 
        className={`scroll-top ${showScrollTop ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </MainLayout>
  );
};

export default HomePage;