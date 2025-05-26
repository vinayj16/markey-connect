import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './HomeKitchen.css';
import { customerAPI } from '../../utils/api';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';

const HomeKitchen = () => {
  const { theme, isDark } = useTheme();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await customerAPI.getAllProducts({ category: 'home_kitchen' });
        setProducts(response.data.products || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching kitchen products:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return ['all', ...uniqueCategories];
  }, [products]);

  const availableTags = useMemo(() => {
    const tags = new Set();
    products.forEach(product => {
      if (product.is_appliance) tags.add('appliance');
      if (product.is_cookware) tags.add('cookware');
      if (product.is_eco_friendly) tags.add('eco-friendly');
      if (product.is_sustainable) tags.add('sustainable');
    });
    return Array.from(tags);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => product[`is_${tag}`]);
      return matchesSearch && matchesCategory && matchesPrice && matchesTags;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'popular':
          return (b.popularity || 0) - (a.popularity || 0);
        case 'newest':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });
  }, [products, searchQuery, selectedCategory, sortBy, priceRange, selectedTags]);

  const featuredItems = filteredProducts.filter(product => product.is_featured).slice(0, 4);
  const applianceSelection = filteredProducts.filter(product => product.is_appliance).slice(0, 3);
  const cookwareSelection = filteredProducts.filter(product => product.is_cookware).slice(0, 3);
  const ecoFriendlySelection = filteredProducts.filter(product => product.is_eco_friendly).slice(0, 2);

  const handleAddToCart = async (productId) => {
    try {
      const success = await addToCart(productId, 1);
      if (success) {
        alert('Product added to cart!');
      } else {
        alert('Failed to add product to cart.');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add product to cart.');
    }
  };

  const handleSearch = (e) => setSearchQuery(e.target.value);
  const handleCategoryChange = (e) => setSelectedCategory(e.target.value);
  const handleSortChange = (e) => setSortBy(e.target.value);
  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setPriceRange(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };
  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('newest');
    setPriceRange({ min: 0, max: 1000 });
    setSelectedTags([]);
  };

  if (loading) {
    return (
      <div className="home-kitchen-container loading">
        <div className="loading-spinner"></div>
        <h2>Loading kitchen products...</h2>
      </div>
    );
  }

  return (
    <div className={`home-kitchen-container ${isDark ? 'dark-theme' : ''}`}>
      <header className="home-kitchen-header">
        <h1>Home & Kitchen Collection</h1>
        <p>Upgrade your kitchen with our premium appliances and cookware</p>
        
        <div className="search-filters">
          <input
            type="text"
            placeholder="Search for kitchen products..."
            className="search-bar"
            value={searchQuery}
            onChange={handleSearch}
          />
          <select
            className="category-select"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          <select
            className="sort-select"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
          <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="advanced-filters">
            <div className="price-range">
              <h3>Price Range</h3>
              <div className="price-inputs">
                <input
                  type="number"
                  name="min"
                  value={priceRange.min}
                  onChange={handlePriceChange}
                  min="0"
                  placeholder="Min"
                />
                <span>to</span>
                <input
                  type="number"
                  name="max"
                  value={priceRange.max}
                  onChange={handlePriceChange}
                  min="0"
                  placeholder="Max"
                />
              </div>
            </div>
            <div className="tag-filters">
              <h3>Product Type</h3>
              <div className="tag-buttons">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    className={`tag-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <button className="clear-filters" onClick={clearFilters}>
              Clear All Filters
            </button>
          </div>
        )}
      </header>

      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span className="separator">›</span>
        <Link to="/vendi/products/all">Products</Link>
        <span className="separator">›</span>
        <span className="breadcrumb-current">Home & Kitchen</span>
      </div>

      {error && <div className="error-message">{error}</div>}

      {featuredItems.length > 0 && (
        <section className="featured-products">
          <h2>Featured Products</h2>
          <div className={`products-grid ${viewMode}`}>
            {featuredItems.map(product => (
              <div className="product-card" key={product.product_id}>
                <div className="product-image">
                  <img 
                    src={product.image_url || 'https://via.placeholder.com/200x200?text=Kitchen'} 
                    alt={product.name} 
                    loading="lazy"
                  />
                  {product.discount > 0 && (
                    <div className="discount-badge">-{product.discount}%</div>
                  )}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-meta">
                    {product.is_appliance && <span className="tag appliance">Appliance</span>}
                    {product.is_cookware && <span className="tag cookware">Cookware</span>}
                    {product.is_eco_friendly && <span className="tag eco-friendly">Eco-Friendly</span>}
                    {product.is_sustainable && <span className="tag sustainable">Sustainable</span>}
                  </div>
                  <p className="product-price">${parseFloat(product.price).toFixed(2)}</p>
                  <div className="product-actions">
                    <Link to={`/vendi/product-details?id=${product.product_id}`}>
                      <button className="view-details-btn">View Details</button>
                    </Link>
                    <button 
                      className="add-to-cart-btn" 
                      onClick={() => handleAddToCart(product.product_id)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {applianceSelection.length > 0 && (
        <section className="appliance-selection">
          <h2>Kitchen Appliances</h2>
          <div className="image-grid">
            {applianceSelection.map((product, index) => (
              <div key={index} className="selection-item">
                <img
                  src={product.image_url || 'https://via.placeholder.com/200x200?text=Appliance'}
                  alt={product.name}
                  loading="lazy"
                />
                <div className="selection-overlay">
                  <h3>{product.name}</h3>
                  <p>${parseFloat(product.price).toFixed(2)}</p>
                  <Link to={`/vendi/product-details?id=${product.product_id}`}>
                    <button className="view-details">View Details</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="all-products">
        <h2>All Kitchen Products</h2>
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏠</div>
            <p className="empty-state-text">No products match your filters.</p>
            <button className="empty-state-action" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={`products-grid ${viewMode}`}>
            {filteredProducts.map(product => (
              <div className="product-card" key={product.product_id}>
                <div className="product-image">
                  <img 
                    src={product.image_url || 'https://via.placeholder.com/200x200?text=Kitchen'} 
                    alt={product.name} 
                    loading="lazy"
                  />
                  {product.discount > 0 && (
                    <div className="discount-badge">-{product.discount}%</div>
                  )}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-meta">
                    {product.is_appliance && <span className="tag appliance">Appliance</span>}
                    {product.is_cookware && <span className="tag cookware">Cookware</span>}
                    {product.is_eco_friendly && <span className="tag eco-friendly">Eco-Friendly</span>}
                    {product.is_sustainable && <span className="tag sustainable">Sustainable</span>}
                  </div>
                  <p className="product-price">${parseFloat(product.price).toFixed(2)}</p>
                  <div className="product-actions">
                    <Link to={`/vendi/product-details?id=${product.product_id}`}>
                      <button className="view-details-btn">View Details</button>
                    </Link>
                    <button 
                      className="add-to-cart-btn" 
                      onClick={() => handleAddToCart(product.product_id)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {cookwareSelection.length > 0 && (
        <section className="cookware-selection">
          <h2>Cookware Collection</h2>
          <div className="image-grid">
            {cookwareSelection.map((product, index) => (
              <div key={index} className="selection-item">
                <img
                  src={product.image_url || 'https://via.placeholder.com/200x200?text=Cookware'}
                  alt={product.name}
                  loading="lazy"
                />
                <div className="selection-overlay">
                  <h3>{product.name}</h3>
                  <p>${parseFloat(product.price).toFixed(2)}</p>
                  <Link to={`/vendi/product-details?id=${product.product_id}`}>
                    <button className="view-details">View Details</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {ecoFriendlySelection.length > 0 && (
        <section className="eco-friendly-selection">
          <h2>Eco-Friendly Options</h2>
          <div className="products-grid">
            {ecoFriendlySelection.map(product => (
              <div className="product-card" key={product.product_id}>
                <div className="product-image">
                  <img 
                    src={product.image_url || 'https://via.placeholder.com/200x200?text=Eco-Friendly'} 
                    alt={product.name} 
                    loading="lazy"
                  />
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-meta">
                    <span className="tag eco-friendly">Eco-Friendly</span>
                    {product.is_sustainable && <span className="tag sustainable">Sustainable</span>}
                  </div>
                  <p className="product-price">${parseFloat(product.price).toFixed(2)}</p>
                  <div className="product-actions">
                    <Link to={`/vendi/product-details?id=${product.product_id}`}>
                      <button className="view-details-btn">View Details</button>
                    </Link>
                    <button 
                      className="add-to-cart-btn" 
                      onClick={() => handleAddToCart(product.product_id)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <button 
        className={`scroll-top ${showScrollTop ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </div>
  );
};

export default HomeKitchen;
