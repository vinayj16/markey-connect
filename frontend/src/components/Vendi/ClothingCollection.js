import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaHeart, FaStar, FaRegStar, FaFilter } from 'react-icons/fa';
import './ClothingCollection.css';

// Sample product data - in a real app, this would come from an API
const sampleProducts = [
  { 
    id: 1, 
    name: 'Premium Cotton T-Shirt', 
    price: 29.99, 
    originalPrice: 39.99,
    rating: 4.5,
    reviewCount: 128,
    image: 'https://via.placeholder.com/300x400?text=Premium+T-Shirt',
    category: 'Tops',
    brand: 'Urban Style',
    colors: ['#2c3e50', '#e74c3c', '#3498db'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true
  },
  { 
    id: 2, 
    name: 'Slim Fit Stretch Jeans', 
    price: 49.99, 
    originalPrice: 69.99,
    rating: 4.2,
    reviewCount: 89,
    image: 'https://via.placeholder.com/300x400?text=Slim+Jeans',
    category: 'Bottoms',
    brand: 'Classic Fit',
    colors: ['#2c3e50', '#7f8c8d'],
    sizes: ['28', '30', '32', '34'],
    inStock: true
  },
  { 
    id: 3, 
    name: 'Floral Summer Dress', 
    price: 39.99, 
    originalPrice: 49.99,
    rating: 4.7,
    reviewCount: 156,
    image: 'https://via.placeholder.com/300x400?text=Summer+Dress',
    category: 'Dresses',
    brand: 'Eco Apparel',
    colors: ['#e74c3c', '#f39c12', '#2ecc71'],
    sizes: ['XS', 'S', 'M', 'L'],
    inStock: true
  },
  { 
    id: 4, 
    name: 'Classic Denim Jacket', 
    price: 59.99, 
    originalPrice: 79.99,
    rating: 4.4,
    reviewCount: 112,
    image: 'https://via.placeholder.com/300x400?text=Denim+Jacket',
    category: 'Outerwear',
    brand: 'Urban Style',
    colors: ['#3498db', '#2c3e50'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true
  },
  { 
    id: 5, 
    name: 'Designer Sneakers', 
    price: 89.99, 
    originalPrice: 119.99,
    rating: 4.8,
    reviewCount: 234,
    image: 'https://via.placeholder.com/300x400?text=Designer+Sneakers',
    category: 'Footwear',
    brand: 'Classic Fit',
    colors: ['#2c3e50', '#7f8c8d', '#e74c3c'],
    sizes: ['7', '8', '9', '10', '11', '12'],
    inStock: true
  },
  { 
    id: 6, 
    name: 'Casual Blazer', 
    price: 79.99, 
    originalPrice: 99.99,
    rating: 4.6,
    reviewCount: 76,
    image: 'https://via.placeholder.com/300x400?text=Casual+Blazer',
    category: 'Outerwear',
    brand: 'Eco Apparel',
    colors: ['#2c3e50', '#95a5a6'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true
  },
];

const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'tops', name: 'Tops & T-Shirts' },
  { id: 'bottoms', name: 'Pants & Jeans' },
  { id: 'dresses', name: 'Dresses & Skirts' },
  { id: 'outerwear', name: 'Jackets & Coats' },
  { id: 'footwear', name: 'Shoes & Footwear' },
  { id: 'accessories', name: 'Accessories' },
];

const brands = [
  { id: 'all', name: 'All Brands' },
  { id: 'urban', name: 'Urban Style' },
  { id: 'classic', name: 'Classic Fit' },
  { id: 'eco', name: 'Eco Apparel' },
  { id: 'sporty', name: 'Sporty & Co' },
  { id: 'luxe', name: 'Luxe Fashion' },
];

const priceRanges = [
  { id: 'all', name: 'All Prices' },
  { id: 'under25', name: 'Under $25' },
  { id: '25to50', name: '$25 - $50' },
  { id: '50to100', name: '$50 - $100' },
  { id: 'over100', name: 'Over $100' },
];

const ClothingCollection = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState(sampleProducts);
  const [filteredProducts, setFilteredProducts] = useState(sampleProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);

  // Filter and sort products based on user selections
  useEffect(() => {
    let result = [...products];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((product) =>
        product.category.toLowerCase().includes(selectedCategory)
      );
    }

    // Filter by brand
    if (selectedBrand !== 'all') {
      result = result.filter((product) =>
        product.brand.toLowerCase().includes(selectedBrand.split(' ')[0].toLowerCase())
      );
    }

    // Filter by price range
    if (selectedPrice !== 'all') {
      switch (selectedPrice) {
        case 'under25':
          result = result.filter((product) => product.price < 25);
          break;
        case '25to50':
          result = result.filter((product) => product.price >= 25 && product.price <= 50);
          break;
        case '50to100':
          result = result.filter((product) => product.price > 50 && product.price <= 100);
          break;
        case 'over100':
          result = result.filter((product) => product.price > 100);
          break;
        default:
          break;
      }
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // Assuming newer items have higher IDs
        result.sort((a, b) => b.id - a.id);
        break;
      default:
        // Featured (default) - no sorting
        break;
    }

    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, selectedBrand, selectedPrice, sortBy, products]);

  // Handle adding item to wishlist
  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Handle adding item to cart
  const addToCart = (product) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Render star rating
  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="star filled" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStar key={i} className="star half" />);
      } else {
        stars.push(<FaRegStar key={i} className="star" />);
      }
    }
    return stars;
  };

  return (
    <div className="clothing-collection-container">
      {/* Hero Banner */}
      <section className="collection-hero">
        <div className="hero-content">
          <h1>Spring Collection 2024</h1>
          <p>Discover the latest trends in fashion for all seasons</p>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search for clothes, brands, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button className="search-button">
              <FaSearch />
            </button>
          </div>
        </div>
      </section>

      <div className="collection-main">
        {/* Filters Sidebar */}
        <aside className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
          <div className="filters-header">
            <h3>Filters</h3>
            <button className="close-filters" onClick={() => setShowFilters(false)}>
              &times;
            </button>
          </div>

          <div className="filter-section">
            <h4>Categories</h4>
            <div className="filter-options">
              {categories.map((category) => (
                <label key={category.id} className="filter-option">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === category.id}
                    onChange={() => setSelectedCategory(category.id)}
                  />
                  <span>{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Brands</h4>
            <div className="filter-options">
              {brands.map((brand) => (
                <label key={brand.id} className="filter-option">
                  <input
                    type="radio"
                    name="brand"
                    checked={selectedBrand === brand.id}
                    onChange={() => setSelectedBrand(brand.id)}
                  />
                  <span>{brand.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Price Range</h4>
            <div className="filter-options">
              {priceRanges.map((range) => (
                <label key={range.id} className="filter-option">
                  <input
                    type="radio"
                    name="price"
                    checked={selectedPrice === range.id}
                    onChange={() => setSelectedPrice(range.id)}
                  />
                  <span>{range.name}</span>
                </label>
              ))}
            </div>
          </div>

          <button 
            className="clear-filters" 
            onClick={() => {
              setSelectedCategory('all');
              setSelectedBrand('all');
              setSelectedPrice('all');
              setSearchQuery('');
            }}
          >
            Clear All Filters
          </button>
        </aside>

        {/* Main Content */}
        <main className="products-container">
          <div className="products-header">
            <h2>
              {selectedCategory === 'all' 
                ? 'All Products' 
                : categories.find(c => c.id === selectedCategory)?.name || 'Products'}
              {searchQuery && `: "${searchQuery}"`}
            </h2>
            <div className="sort-options">
              <span>Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest Arrivals</option>
              </select>
              <button 
                className="mobile-filters-button" 
                onClick={() => setShowFilters(true)}
              >
                <FaFilter /> Filters
              </button>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="no-results">
              <h3>No products found</h3>
              <p>Try adjusting your search or filter criteria</p>
              <button 
                className="clear-filters"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedBrand('all');
                  setSelectedPrice('all');
                  setSearchQuery('');
                }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                    <div className="product-actions">
                      <button 
                        className={`wishlist-button ${wishlist.includes(product.id) ? 'active' : ''}`}
                        onClick={() => toggleWishlist(product.id)}
                        aria-label={wishlist.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <FaHeart />
                      </button>
                      <button 
                        className="quick-view"
                        onClick={() => navigate(`/vendi/product/${product.id}`)}
                      >
                        Quick View
                      </button>
                    </div>
                    {!product.inStock && (
                      <div className="out-of-stock">Out of Stock</div>
                    )}
                  </div>
                  <div className="product-details">
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-brand">{product.brand}</div>
                    <div className="product-rating">
                      <div className="stars">
                        {renderRating(product.rating)}
                        <span className="rating-number">{product.rating}</span>
                      </div>
                      <span className="review-count">({product.reviewCount})</span>
                    </div>
                    <div className="product-price">
                      ${product.price.toFixed(2)}
                      {product.originalPrice > product.price && (
                        <span className="original-price">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="color-options">
                      {product.colors.map((color, index) => (
                        <span 
                          key={index} 
                          className="color-option" 
                          style={{ backgroundColor: color }}
                          title={`Color ${index + 1}`}
                        />
                      ))}
                    </div>
                    <button 
                      className="add-to-cart-button"
                      onClick={() => addToCart(product)}
                      disabled={!product.inStock}
                    >
                      <FaShoppingCart /> Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Quick View Modal (to be implemented) */}
      {/* <QuickViewModal product={selectedProduct} onClose={closeQuickView} /> */}

      {/* Mobile Filters Overlay */}
      {showFilters && (
        <div className="mobile-filters-overlay" onClick={() => setShowFilters(false)} />
      )}
    </div>
  );
};

export default ClothingCollection;
