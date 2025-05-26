// src/components/Vendi/DiscoverProducts.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiSearch, FiFilter, FiHeart, FiEye, FiShoppingBag, FiChevronDown } from 'react-icons/fi';
import './DiscoverProducts.css';
import ProductQuickView from './ProductQuickView';
import { customerAPI } from '../../utils/api';
import MainLayout from '../layout/MainLayout';

const DiscoverProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortOption, setSortOption] = useState('relevance');

  // Fetch products with pagination
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await customerAPI.getAllProducts({
          page: currentPage,
          search: searchQuery,
          category: activeFilter === 'all' ? '' : activeFilter,
          minPrice: priceRange.min,
          maxPrice: priceRange.max,
          sort: sortOption
        });
        setProducts(response.data.products || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Add item to cart
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product_id === product.product_id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  // Filter products based on search and active filter
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || product.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Available categories for filtering
  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'home', name: 'Home & Garden' },
    { id: 'beauty', name: 'Beauty' },
  ];

  if (loading) {
    return (
      <MainLayout userType="customer" pageTitle="Discover Products">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userType="customer" pageTitle="Discover Products">
      <div className="discover-container">
        <Link to="/vendi" className="back-to-dashboard">
          <FiArrowLeft /> Back to Dashboard
        </Link>

        <header className="discover-header">
          <div>
            <h1>Discover Amazing Products</h1>
            <p>Find the perfect items tailored just for you</p>
          </div>
          <button 
            className="cart-icon" 
            onClick={() => setIsCartOpen(true)}
            aria-label="View cart"
          >
            <FiShoppingCart size={24} />
            {cartItems.length > 0 && (
              <span className="cart-badge">{cartItems.length}</span>
            )}
          </button>
        </header>

        <div className="filters">
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-tags">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`filter-tag ${activeFilter === category.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <main>
          <div className="products-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.product_id} className="product-card">
                  <img 
                    src={product.image_url || 'https://via.placeholder.com/300x200?text=Product+Image'} 
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                    }}
                  />
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-price">${parseFloat(product.price).toFixed(2)}</p>
                    <p className="product-description">
                      {product.description?.substring(0, 100) || 'No description available.'}
                    </p>
                    <div className="product-actions">
                      <button 
                        className="btn btn-primary"
                        onClick={() => addToCart(product)}
                      >
                        <FiShoppingBag className="btn-icon" /> Add to Cart
                      </button>
                      <Link 
                        to={`/vendi/product-details/${product.product_id}`}
                        className="btn btn-outline"
                      >
                        <FiEye className="btn-icon" /> View
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No products found. Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </main>

        {/* Shopping Cart Sidebar */}
        <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
          <div className="cart-header">
            <h3>Your Cart</h3>
            <button className="close-btn" onClick={() => setIsCartOpen(false)}>
              ×
            </button>
          </div>
          <div className="cart-content">
            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <FiShoppingCart size={48} className="empty-cart-icon" />
                <p>Your cart is empty</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setIsCartOpen(false)}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <ul className="cart-items">
                  {cartItems.map((item) => (
                    <li key={item.product_id} className="cart-item">
                      <img 
                        src={item.image_url || 'https://via.placeholder.com/80'}
                        alt={item.name}
                        className="cart-item-image"
                      />
                      <div className="cart-item-details">
                        <h4>{item.name}</h4>
                        <p>${parseFloat(item.price).toFixed(2)} × {item.quantity}</p>
                        <div className="cart-item-actions">
                          <button 
                            className="quantity-btn"
                            onClick={() => {
                              if (item.quantity > 1) {
                                setCartItems(cartItems.map(i => 
                                  i.product_id === item.product_id 
                                    ? { ...i, quantity: i.quantity - 1 } 
                                    : i
                                ));
                              } else {
                                setCartItems(cartItems.filter(i => i.product_id !== item.product_id));
                              }
                            }}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button 
                            className="quantity-btn"
                            onClick={() => {
                              setCartItems(cartItems.map(i => 
                                i.product_id === item.product_id 
                                  ? { ...i, quantity: i.quantity + 1 } 
                                  : i
                              ));
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button 
                        className="remove-item"
                        onClick={() => {
                          setCartItems(cartItems.filter(i => i.product_id !== item.product_id));
                        }}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="cart-summary">
                  <div className="cart-total">
                    <span>Total:</span>
                    <span>$
                      {cartItems
                        .reduce((total, item) => total + (item.price * item.quantity), 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <button 
                    className="btn btn-primary checkout-btn"
                    onClick={() => {
                      navigate('/vendi/checkout');
                      setIsCartOpen(false);
                    }}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DiscoverProducts;