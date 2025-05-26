import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar, FiFilter } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../../store/wishlistSlice';
import './Beauty.css';
import { customerAPI } from '../../utils/api';

const Beauty = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState({
    priceRange: 'all',
    rating: 0,
    inStock: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState({});
  
  // Redux
  const dispatch = useDispatch();
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  
  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await customerAPI.getAllProducts({ category: 'beauty' });
        const productsData = response.data.products || [];
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (err) {
        console.error('Error fetching beauty products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];
    
    // Apply filters
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number);
      result = result.filter(product => {
        const price = parseFloat(product.price);
        return price >= min && (isNaN(max) || price <= max);
      });
    }
    
    if (filters.rating > 0) {
      result = result.filter(product => 
        product.rating >= filters.rating
      );
    }
    
    if (filters.inStock) {
      result = result.filter(product => 
        product.stock_quantity > 0
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });
    
    setFilteredProducts(result);
  }, [products, filters, sortBy]);
  
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };
  
  const resetFilters = () => {
    setFilters({
      priceRange: 'all',
      rating: 0,
      inStock: false
    });
    setSortBy('newest');
  };

  const toggleWishlist = async (product, e) => {
    if (e) e.stopPropagation();
    
    const productId = product.product_id || product.id;
    setWishlistLoading(prev => ({ ...prev, [productId]: true }));
    
    try {
      if (isInWishlist(productId)) {
        await dispatch(removeFromWishlist(productId)).unwrap();
      } else {
        const productData = {
          id: product.product_id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          stock_quantity: product.stock_quantity
        };
        await dispatch(addToWishlist(productData)).unwrap();
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    } finally {
      setWishlistLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        window.location.href = '/vendi/login';
        return;
      }

      await customerAPI.addToCart({ productId, quantity: 1 });
      alert('Product added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add product to cart.');
    }
  };

  const renderLoadingSkeleton = () => (
    <div className="products-grid">
      {[...Array(8)].map((_, index) => (
        <div className="product-card skeleton" key={index}>
          <div className="product-image"></div>
          <div className="product-info">
            <div className="skeleton-line title"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line price"></div>
          </div>
        </div>
      ))}
    </div>
  );
  
  if (loading) {
    return (
      <div className="beauty-container">
        <header className="category-header">
          <h1>Beauty Collection</h1>
          <p>Discover premium beauty products to enhance your natural beauty</p>
        </header>
        {renderLoadingSkeleton()}
      </div>
    );
  }

  return (
    <div className="beauty-container">
      <header className="category-header">
        <h1>Beauty Collection</h1>
        <p>Discover premium beauty products to enhance your natural beauty</p>
      </header>

      <div className="breadcrumb">
        <Link to="/">Home</Link> &gt; <Link to="/vendi/products/all">Products</Link> &gt; Beauty
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="category-controls">
        <button 
          className="filter-toggle" 
          onClick={() => setShowFilters(!showFilters)}
        >
          <FiFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        
        <div className="sort-group">
          <label>Sort by:</label>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      <div className="content-wrapper">
        {showFilters && (
          <div className="filters-sidebar">
            <div className="filter-section">
              <h3>Price Range</h3>
              <select 
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Prices</option>
                <option value="0-25">Under $25</option>
                <option value="25-50">$25 - $50</option>
                <option value="50-100">$50 - $100</option>
                <option value="100-0">Over $100</option>
              </select>
            </div>
            
            <div className="filter-section">
              <h3>Minimum Rating</h3>
              <div className="rating-filter">
                {[4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    className={`rating-option ${filters.rating === rating ? 'active' : ''}`}
                    onClick={() => handleFilterChange('rating', filters.rating === rating ? 0 : rating)}
                  >
                    {[...Array(5)].map((_, i) => (
                      <FiStar 
                        key={i} 
                        className={`star ${i < rating ? 'filled' : ''}`} 
                      />
                    ))}
                    <span>& Up</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="filter-section">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={filters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                />
                In Stock Only
              </label>
            </div>
            
            <button className="reset-filters" onClick={resetFilters}>
              Reset All Filters
            </button>
          </div>
        )}
        
        <div className="products-container">
          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <p>No products match your filters.</p>
              <button onClick={resetFilters} className="reset-btn">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <div className="product-card" key={product.product_id}>
                  <div className="product-image">
                    <img 
                      src={product.image_url || 'https://via.placeholder.com/300x300?text=Beauty+Product'} 
                      alt={product.name}
                      loading="lazy"
                      onClick={() => navigate(`/vendi/product-details?id=${product.product_id}`)}
                    />
                    <button 
                      className={`wishlist-btn ${isInWishlist(product.product_id) ? 'active' : ''}`}
                      onClick={(e) => toggleWishlist(product, e)}
                      disabled={wishlistLoading[product.product_id]}
                      aria-label={isInWishlist(product.product_id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <FiHeart />
                    </button>
                    {product.stock_quantity === 0 && (
                      <span className="out-of-stock">Out of Stock</span>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 onClick={() => navigate(`/vendi/product-details?id=${product.product_id}`)}>
                      {product.name}
                    </h3>
                    <div className="product-rating">
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <FiStar 
                            key={i} 
                            className={i < Math.floor(product.rating || 0) ? 'filled' : ''} 
                          />
                        ))}
                        <span>({product.review_count || 0})</span>
                      </div>
                    </div>
                    <p className="product-price">
                      ${parseFloat(product.price).toFixed(2)}
                      {product.original_price && (
                        <span className="original-price">
                          ${parseFloat(product.original_price).toFixed(2)}
                        </span>
                      )}
                    </p>
                    <div className="product-actions">
                      <button 
                        className="add-to-cart-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product.product_id);
                        }}
                        disabled={product.stock_quantity === 0}
                      >
                        <FiShoppingCart />
                        {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Beauty;
