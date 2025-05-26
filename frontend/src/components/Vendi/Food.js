import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiEye, FiFrown, FiFilter, FiChevronDown } from 'react-icons/fi';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { customerAPI } from '../../utils/api';
import FoodGroceries from './FoodGroceries';
import './Food.css';

const Food = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterVisible, setFilterVisible] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [addingToCart, setAddingToCart] = useState(null);
  const [toast, setToast] = useState({visible: false, message: '', type: ''});
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [dietaryFilters, setDietaryFilters] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    organic: false
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await customerAPI.getAllProducts({ category: 'food' });
        const products = response.data.products || [];
        
        // Sort products based on sortBy value
        const sortedProducts = sortProducts(products, sortBy);
        setProducts(sortedProducts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching food products:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sortBy]);

  const sortProducts = (products, criterion) => {
    const productsCopy = [...products];
    
    switch(criterion) {
      case 'price-low':
        return productsCopy.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      case 'price-high':
        return productsCopy.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      case 'popular':
        return productsCopy.sort((a, b) => b.sales_count - a.sales_count);
      case 'newest':
      default:
        return productsCopy.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  };

  const addToCart = async (productId) => {
    try {
      setAddingToCart(productId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Show success toast
      setToast({
        visible: true,
        message: 'Product added to cart successfully!',
        type: 'success'
      });
      
      // Hide toast after 3 seconds
      setTimeout(() => {
        setToast({visible: false, message: '', type: ''});
      }, 3000);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      // Show error toast
      setToast({
        visible: true,
        message: 'Failed to add product to cart. Please try again.',
        type: 'error'
      });
      
      // Hide toast after 3 seconds
      setTimeout(() => {
        setToast({visible: false, message: '', type: ''});
      }, 3000);
    } finally {
      setAddingToCart(null);
    }
  };

  const openQuickView = (product) => {
    setQuickViewProduct(product);
  };
  
  const closeQuickView = () => {
    setQuickViewProduct(null);
  };
  
  const handleDietaryFilterChange = (filter) => {
    setDietaryFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };
  
  const filterProductsByDietary = (products) => {
    return products.filter(product => {
      // If no filters are active, show all products
      if (!Object.values(dietaryFilters).some(value => value)) {
        return true;
      }
      
      // Apply active filters
      const matchesFilters = (
        (dietaryFilters.vegetarian && product.is_vegetarian) ||
        (dietaryFilters.vegan && product.is_vegan) ||
        (dietaryFilters.glutenFree && product.is_gluten_free) ||
        (dietaryFilters.organic && product.is_organic)
      );
      
      return matchesFilters;
    });
  };
  
  // Apply all filters
  const filteredProducts = filterProductsByDietary(products).filter(product => {
    return product.price >= priceRange[0] && product.price <= priceRange[1];
  });

  if (loading) {
    return (
      <div className="food-container loading">
        <header className="category-header skeleton">
          <div className="skeleton-text skeleton-title"></div>
          <div className="skeleton-text skeleton-subtitle"></div>
        </header>
        
        <div className="skeleton-filters"></div>
        
        <div className="products-grid">
          {[1, 2, 3, 4, 5, 6].map(item => (
            <div className="product-card skeleton" key={item}>
              <div className="skeleton-image"></div>
              <div className="skeleton-content">
                <div className="skeleton-text skeleton-title"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text skeleton-price"></div>
                <div className="skeleton-buttons">
                  <div className="skeleton-button"></div>
                  <div className="skeleton-button"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="food-container">
      <FoodGroceries 
        products={filteredProducts}
        onAddToCart={addToCart}
        onQuickView={openQuickView}
      />
      
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span className="separator">›</span>
        <Link to="/vendi/products/all">All Products</Link>
        <span className="separator">›</span>
        <span className="breadcrumb-current">Food & Groceries</span>
      </div>

      <header className="category-header">
        <h1>Food & Groceries</h1>
        <p>Fresh, delicious, and healthy food products for your daily needs</p>
      </header>

      <div className="category-filters">
        <div className="filter-group">
          <label>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
        
        <button 
          className="filter-toggle" 
          onClick={() => setFilterVisible(!filterVisible)}
        >
          <FiFilter /> {filterVisible ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {filterVisible && (
        <div className="expanded-filters">
          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="price-range">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={priceRange[0]} 
                onChange={(e) => {
                  const newValue = parseInt(e.target.value);
                  if (newValue < priceRange[1]) {
                    setPriceRange([newValue, priceRange[1]]);
                  }
                }}
                className="range-slider"
              />
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={priceRange[1]} 
                onChange={(e) => {
                  const newValue = parseInt(e.target.value);
                  if (newValue > priceRange[0]) {
                    setPriceRange([priceRange[0], newValue]);
                  }
                }}
                className="range-slider"
              />
              <div className="price-labels">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}+</span>
              </div>
            </div>
          </div>

          <div className="filter-section">
            <h3>Dietary Preferences</h3>
            <div className="dietary-filters">
              <label className="filter-option">
                <input 
                  type="checkbox" 
                  checked={dietaryFilters.vegetarian}
                  onChange={() => handleDietaryFilterChange('vegetarian')}
                />
                <span>Vegetarian</span>
              </label>
              <label className="filter-option">
                <input 
                  type="checkbox" 
                  checked={dietaryFilters.vegan}
                  onChange={() => handleDietaryFilterChange('vegan')}
                />
                <span>Vegan</span>
              </label>
              <label className="filter-option">
                <input 
                  type="checkbox" 
                  checked={dietaryFilters.glutenFree}
                  onChange={() => handleDietaryFilterChange('glutenFree')}
                />
                <span>Gluten Free</span>
              </label>
              <label className="filter-option">
                <input 
                  type="checkbox" 
                  checked={dietaryFilters.organic}
                  onChange={() => handleDietaryFilterChange('organic')}
                />
                <span>Organic</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {error ? (
        <div className="error-state">
          <FiFrown size={48} />
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <FiFrown size={48} />
          <h3>No products found</h3>
          <p>Try adjusting your filters or check back later for new arrivals.</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div className="product-card" key={product.id}>
              <div className="product-image">
                <img src={product.image_url || '/placeholder-food.jpg'} alt={product.name} />
                <div className="product-badges">
                  {product.is_new && <span className="badge new">New</span>}
                  {product.discount > 0 && <span className="badge discount">-{product.discount}%</span>}
                </div>
                <button 
                  className="quick-view-btn"
                  onClick={() => openQuickView(product)}
                >
                  <FiEye /> Quick View
                </button>
              </div>
              <div className="product-details">
                <h3 className="product-title">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                
                <div className="product-meta">
                  {product.is_vegetarian && <span className="tag vegetarian">Vegetarian</span>}
                  {product.is_vegan && <span className="tag vegan">Vegan</span>}
                  {product.is_gluten_free && <span className="tag gluten-free">Gluten Free</span>}
                  {product.is_organic && <span className="tag organic">Organic</span>}
                </div>
                
                <div className="product-footer">
                  <div className="price">
                    {product.discount > 0 ? (
                      <>
                        <span className="original-price">${product.price.toFixed(2)}</span>
                        <span className="sale-price">
                          ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="current-price">${product.price.toFixed(2)}</span>
                    )}
                    <span className="unit">/ {product.unit || 'item'}</span>
                  </div>
                  
                  <button 
                    className={`add-to-cart-btn ${addingToCart === product.id ? 'adding' : ''}`}
                    onClick={() => addToCart(product.id)}
                    disabled={addingToCart === product.id}
                  >
                    {addingToCart === product.id ? (
                      <span className="spinner"></span>
                    ) : (
                      <>
                        <FiShoppingCart /> Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {quickViewProduct && (
        <div className="quick-view-overlay" onClick={closeQuickView}>
          <div className="quick-view-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeQuickView}>&times;</button>
            <div className="quick-view-content">
              <div className="quick-view-image">
                <img 
                  src={quickViewProduct.image_url || '/placeholder-food.jpg'} 
                  alt={quickViewProduct.name} 
                />
              </div>
              <div className="quick-view-details">
                <h2>{quickViewProduct.name}</h2>
                <div className="product-meta">
                  {quickViewProduct.is_vegetarian && <span className="tag vegetarian">Vegetarian</span>}
                  {quickViewProduct.is_vegan && <span className="tag vegan">Vegan</span>}
                  {quickViewProduct.is_gluten_free && <span className="tag gluten-free">Gluten Free</span>}
                  {quickViewProduct.is_organic && <span className="tag organic">Organic</span>}
                </div>
                <p className="description">{quickViewProduct.long_description || quickViewProduct.description}</p>
                
                <div className="nutrition-facts">
                  <h4>Nutrition Facts</h4>
                  <ul>
                    <li><strong>Calories:</strong> {quickViewProduct.calories || 'N/A'}</li>
                    <li><strong>Protein:</strong> {quickViewProduct.protein || 'N/A'}g</li>
                    <li><strong>Carbs:</strong> {quickViewProduct.carbs || 'N/A'}g</li>
                    <li><strong>Fat:</strong> {quickViewProduct.fat || 'N/A'}g</li>
                  </ul>
                </div>
                
                <div className="price">
                  {quickViewProduct.discount > 0 ? (
                    <>
                      <span className="original-price">${quickViewProduct.price.toFixed(2)}</span>
                      <span className="sale-price">
                        ${(quickViewProduct.price * (1 - quickViewProduct.discount / 100)).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="current-price">${quickViewProduct.price.toFixed(2)}</span>
                  )}
                  <span className="unit">/ {quickViewProduct.unit || 'item'}</span>
                </div>
                
                <div className="quantity-selector">
                  <label>Quantity:</label>
                  <div className="quantity-controls">
                    <button>-</button>
                    <input type="number" min="1" defaultValue="1" />
                    <button>+</button>
                  </div>
                </div>
                
                <button 
                  className="add-to-cart-btn large"
                  onClick={() => {
                    addToCart(quickViewProduct.id);
                    closeQuickView();
                  }}
                  disabled={addingToCart === quickViewProduct.id}
                >
                  {addingToCart === quickViewProduct.id ? (
                    <span className="spinner"></span>
                  ) : (
                    <>
                      <FiShoppingCart /> Add to Cart
                    </>
                  )}
                </button>
                
                <div className="product-meta-footer">
                  <div className="meta-item">
                    <strong>Category:</strong> {quickViewProduct.category || 'N/A'}
                  </div>
                  <div className="meta-item">
                    <strong>Vendor:</strong> {quickViewProduct.vendor_name || 'N/A'}
                  </div>
                  <div className="meta-item">
                    <strong>Stock:</strong> {quickViewProduct.stock_quantity > 0 ? `${quickViewProduct.stock_quantity} available` : 'Out of stock'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast.visible && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Food;
