import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import { customerAPI } from '../../utils/api';
import './AllProducts.css';

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    minPrice: '',
    maxPrice: '',
    vendor: '',
    rating: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getAllProducts();
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
      setLoading(false);
    }
  };

  // If API call fails, use sample data
  const sampleProducts = [
    { product_id: 1, name: 'Smartphone X12', price: 799.99, vendor_name: 'TechVendor Inc.', category: 'electronics', image_url: '' },
    { product_id: 2, name: 'Wireless Earbuds', price: 129.99, vendor_name: 'AudioTech Inc.', category: 'electronics', image_url: '' },
    { product_id: 3, name: 'Designer Handbag', price: 249.99, vendor_name: 'FashionHub', category: 'fashion', image_url: '' },
    { product_id: 4, name: 'Smart Home Hub', price: 149.99, vendor_name: 'HomeConnect', category: 'home', image_url: '' },
    { product_id: 5, name: 'Organic Skincare Set', price: 99.99, vendor_name: 'NaturalBeauty', category: 'beauty', image_url: '' },
    { product_id: 6, name: 'Smart Watch', price: 199.99, vendor_name: 'TechVendor Inc.', category: 'electronics', image_url: '' },
    { product_id: 7, name: 'Coffee Maker', price: 79.99, vendor_name: 'HomeConnect', category: 'home', image_url: '' },
    { product_id: 8, name: 'Leather Wallet', price: 49.99, vendor_name: 'FashionHub', category: 'fashion', image_url: '' },
  ];

  // Use sample data if API call fails
  const displayProducts = products.length > 0 ? products : sampleProducts;

  const topVendors = [
    { name: 'TechVendor Inc.', description: 'Premium electronics and gadgets' },
    { name: 'FashionHub', description: 'Trendy clothing and accessories' },
    { name: 'HomeConnect', description: 'Smart home solutions and furniture' },
    { name: 'NaturalBeauty', description: 'Organic skincare and wellness products' },
  ];

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleCategoryClick = (category) => {
    setFilters({
      ...filters,
      category
    });
  };

  const applyFilters = () => {
    // In a real app, this would trigger an API call with the filters
    console.log('Applying filters:', filters);
    // For now, we'll just log the filters
  };

  const handleAddToCart = async (productId) => {
    try {
      await customerAPI.addToCart({ productId, quantity: 1 });
      alert('Product added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      if (err.response?.status === 401) {
        // User not logged in
        navigate('/vendi/login', { state: { from: '/vendi/products/all' } });
      } else {
        alert(err.response?.data?.error || 'Failed to add item to cart');
      }
    }
  };

  const handleViewDetails = (productId) => {
    navigate(`/vendi/product-details?id=${productId}`);
  };

  // Filter products based on search term and category
  const filteredProducts = displayProducts.filter(product => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.vendor_name && product.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by category
    const matchesCategory = filters.category === 'all' || 
      (product.category && product.category.toLowerCase() === filters.category.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout userType="guest" pageTitle="All Products" showSearchBar={true}>
      <div className="all-products-container">
        {/* Search and Filters */}
        <div className="search-and-filters">
          <input 
            type="text" 
            placeholder="Search products, vendors, categories..." 
            className="search-bar"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <div className="filters">
            <div className="filter-category">
              <span 
                className={filters.category === 'all' ? 'active' : ''} 
                onClick={() => handleCategoryClick('all')}
              >
                All Products
              </span>
              <span 
                className={filters.category === 'electronics' ? 'active' : ''} 
                onClick={() => handleCategoryClick('electronics')}
              >
                Electronics
              </span>
              <span 
                className={filters.category === 'fashion' ? 'active' : ''} 
                onClick={() => handleCategoryClick('fashion')}
              >
                Fashion
              </span>
              <span 
                className={filters.category === 'home' ? 'active' : ''} 
                onClick={() => handleCategoryClick('home')}
              >
                Home & Garden
              </span>
              <span 
                className={filters.category === 'beauty' ? 'active' : ''} 
                onClick={() => handleCategoryClick('beauty')}
              >
                Beauty
              </span>
            </div>
            <div className="filter-options">
              <div className="filter-option">
                <span>Price Range</span>
                <input 
                  type="text" 
                  placeholder="Min" 
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                />
                <input 
                  type="text" 
                  placeholder="Max" 
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="filter-option">
                <span>Vendor</span>
                <select name="vendor" value={filters.vendor} onChange={handleFilterChange}>
                  <option value="">Select vendor</option>
                  {topVendors.map((vendor, index) => (
                    <option key={index} value={vendor.name}>{vendor.name}</option>
                  ))}
                </select>
              </div>
              <div className="filter-option">
                <span>Rating</span>
                <select name="rating" value={filters.rating} onChange={handleFilterChange}>
                  <option value="">Select minimum rating</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                </select>
              </div>
              <button className="apply-filters-btn" onClick={applyFilters}>Apply</button>
            </div>
          </div>
        </div>

        {/* Products */}
        <section className="products-section">
          <h2>Products</h2>
          {loading ? (
            <div className="loading-spinner">Loading products...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="no-products">
              <p>No products found matching your criteria.</p>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <div className="product-card" key={product.product_id}>
                    <div className="product-image">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} />
                      ) : (
                        <div className="placeholder-image">No Image</div>
                      )}
                    </div>
                    <h3>{product.name}</h3>
                    <p className="product-price">${parseFloat(product.price).toFixed(2)}</p>
                    <p className="product-vendor">By {product.vendor_name}</p>
                    <div className="card-buttons">
                      <button 
                        className="add-to-cart"
                        onClick={() => handleAddToCart(product.product_id)}
                      >
                        Add to Cart
                      </button>
                      <button 
                        className="details"
                        onClick={() => handleViewDetails(product.product_id)}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="load-more-btn">Load More Products</button>
            </>
          )}
        </section>

        {/* Top Vendors */}
        <section className="top-vendors">
          <h2>Top Vendors</h2>
          <div className="vendor-list">
            {topVendors.map((vendor, index) => (
              <div className="vendor-card" key={index}>
                <div className="vendor-logo">
                  {/* Placeholder for vendor logo */}
                  <div className="placeholder-logo">{vendor.name.charAt(0)}</div>
                </div>
                <h3>{vendor.name}</h3>
                <p>{vendor.description}</p>
                <Link to={`/vendor/profile/${vendor.name}`} className="view-vendor">
                  View Products
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default AllProducts;
