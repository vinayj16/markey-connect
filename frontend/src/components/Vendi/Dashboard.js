import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { customerAPI, logout } from '../../utils/api';
import MainLayout from '../layout/MainLayout';

const Dashboard = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if customer is logged in
    const customerInfo = localStorage.getItem('customerInfo');
    const customerToken = localStorage.getItem('customerToken');
    
    if (!customerInfo || !customerToken) {
      navigate('/vendi/login');
      return;
    }
    
    // Get customer profile, orders and trending products
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get customer profile
        const profileResponse = await customerAPI.getProfile();
        setCustomer(profileResponse.data.customer);
        
        // Get customer orders
        const ordersResponse = await customerAPI.getCustomerOrders();
        setOrders(ordersResponse.data.orders || []);
        
        // Get trending products
        const productsResponse = await customerAPI.getAllProducts();
        setProducts(productsResponse.data.products || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        if (err.response && err.response.status === 401) {
          logout('customer');
          navigate('/vendi/login');
        }
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [navigate]);
  
  // Handle logout
  const handleLogout = () => {
    logout('customer');
    navigate('/vendi/login');
  };

  const handleBrowseNow = () => {
    navigate('/vendi/products'); // Redirect to ProductListing
  };

  const handleCompleteProfile = () => {
    navigate('/vendi/profile-settings'); // Redirect to ProfileSettings
  };

  const handleCustomizeFeed = () => {
    navigate('/vendi/discover-products'); // Redirect to DiscoverProducts
  };

  if (loading) {
    return (
      <MainLayout userType="customer" pageTitle="Dashboard">
        <div className="container text-center py-xl">
          <div className="spinner-large"></div>
          <p className="mt-md">Loading your dashboard...</p>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout userType="customer" pageTitle="Dashboard">
      <div className="dashboard-container">

      {error && <div className="error-message">{error}</div>}

      {/* Welcome Section */}
      <section className="welcome-section">
        <h1>Welcome to MarketConnect, {customer ? customer.name : 'Shopper'}!</h1>
        <p>Your personalized shopping experience awaits. Here's what you can do:</p>
      </section>

      {/* Main Actions */}
      <section className="main-actions">
        <div className="action-card" onClick={handleBrowseNow}>
          <div className="action-icon">
            <FiShoppingBag size={24} />
          </div>
          <h2>Browse Products</h2>
          <p>Explore a wide range of the latest products with special offers.</p>
          <button className="action-btn">Browse Now</button>
        </div>
        <div className="action-card" onClick={handleCompleteProfile}>
          <div className="action-icon">
            <FiUser size={24} />
          </div>
          <h2>Complete Profile</h2>
          <p>Add payment details and shipping addresses to complete your profile.</p>
          <button className="action-btn">Complete</button>
        </div>
        <div className="action-card" onClick={handleCustomizeFeed}>
          <div className="action-icon">
            <FiCompass size={24} />
          </div>
          <h2>Discover Products</h2>
          <p>Get personalized recommendations based on your preferences.</p>
          <button className="action-btn">Discover Now</button>
        </div>
      </section>

      {/* Trending Products */}
      <section className="trending-products">
        <h2>Trending Products</h2>
        <div className="product-list">
          {products.length === 0 ? (
            <p>No products available at the moment.</p>
          ) : (
            products.slice(0, 4).map((product) => (
              <div className="product-card" key={product.product_id}>
                <img 
                  src={product.image_url || 'https://via.placeholder.com/150'} 
                  alt={product.name} 
                />
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="price">${parseFloat(product.price).toFixed(2)}</p>
                  <Link to={`/vendi/product-details?id=${product.product_id}`}>
                    <button className="view-btn">View Details</button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="view-all">
          <Link to="/vendi/products/all">View All Products</Link>
        </div>
      </section>

      {/* Recent Orders */}
      <section className="recent-orders">
        <h2>Your Recent Orders</h2>
        {orders.length === 0 ? (
          <p>You haven't placed any orders yet.</p>
        ) : (
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 3).map((order) => (
                  <tr key={order.order_id}>
                    <td>{order.order_id}</td>
                    <td>{new Date(order.order_date).toLocaleDateString()}</td>
                    <td>${parseFloat(order.total_amount).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/vendi/order-details/${order.order_id}`}>
                        <button className="view-btn">View</button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length > 3 && (
              <div className="view-all">
                <Link to="/vendi/orders">View All Orders</Link>
              </div>
            )}
          </div>
        )}
      </section>

        {/* Shopping Categories */}
        <section className="shopping-categories">
          <h2>Shop by Category</h2>
          <div className="categories-grid">
            <Link to="/vendi/products/electronics" className="category-card">
              <div className="category-icon">📱</div>
              <h3>Electronics</h3>
            </Link>
            <Link to="/vendi/products/clothing" className="category-card">
              <div className="category-icon">👕</div>
              <h3>Clothing</h3>
            </Link>
            <Link to="/vendi/products/home-garden" className="category-card">
              <div className="category-icon">🏠</div>
              <h3>Home & Garden</h3>
            </Link>
            <Link to="/vendi/products/beauty" className="category-card">
              <div className="category-icon">💄</div>
              <h3>Beauty</h3>
            </Link>
            <Link to="/vendi/products/books" className="category-card">
              <div className="category-icon">📚</div>
              <h3>Books</h3>
            </Link>
            <Link to="/vendi/products/sports-outdoor" className="category-card">
              <div className="category-icon">⚽</div>
              <h3>Sports & Outdoors</h3>
            </Link>
          </div>
          <div className="view-all">
            <Link to="/vendi/categories">Browse All Categories</Link>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
