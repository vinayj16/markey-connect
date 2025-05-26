import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './VendorDashboard.css';
import { vendorAPI, logout } from '../../utils/api';

const VendorDashboard = () => {
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalInventory: 0
  });
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get vendor profile
      const profileResponse = await vendorAPI.getProfile();
      setVendor(profileResponse.data.vendor);
      
      // Get vendor products
      const productsResponse = await vendorAPI.getProducts();
      const productsData = productsResponse.data.products || [];
      setProducts(productsData);
      
      // Get vendor orders
      const ordersResponse = await vendorAPI.getOrders();
      const ordersData = ordersResponse.data.orders || [];
      setOrders(ordersData);
      
      // Calculate stats
      const totalRevenue = ordersData.reduce((total, order) => 
        total + parseFloat(order.total_amount), 0);
      const totalInventory = productsData.reduce((sum, product) => 
        sum + product.stock_quantity, 0);
      
      setStats({
        totalRevenue: totalRevenue.toFixed(2),
        totalProducts: productsData.length,
        totalOrders: ordersData.length,
        totalInventory
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      if (err.response?.status === 401) {
        logout('vendor');
        navigate('/vendor/login');
      } else {
        setError('Failed to load dashboard data. Please try again.');
      }
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // Check if vendor is logged in
    const vendorInfo = localStorage.getItem('vendorInfo');
    const vendorToken = localStorage.getItem('vendorToken');
    
    if (!vendorInfo || !vendorToken) {
      navigate('/vendor/login');
      return;
    }

    fetchDashboardData();
  }, [navigate, fetchDashboardData]);

  const handleLogout = useCallback(() => {
    logout('vendor');
    navigate('/vendor/login');
  }, [navigate]);

  const handleAddProduct = useCallback(() => {
    navigate('/vendor/add-product');
  }, [navigate]);

  const handleUpdateProfile = useCallback(() => {
    navigate('/vendor/profile-update');
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="dashboard-container loading">
        <div className="loading-spinner"></div>
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Welcome, {vendor?.business_name || 'Vendor'}</h2>
        <div className="header-actions">
          <button className="refresh-btn" onClick={handleRefresh}>
            Refresh
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      
      <nav className="breadcrumb">
        <Link to="/">Home</Link> &gt; <Link to="/vendor">Vendor</Link> &gt; Dashboard
      </nav>

      {error && (
        <div className="error-message">
          <span>⚠️</span> {error}
          <button className="retry-btn" onClick={handleRefresh}>
            Try Again
          </button>
        </div>
      )}

      <section className="account-status">
        <h4>Account Status</h4>
        <div className="status-box">
          <p className="status-title">ACTIVE</p>
          <h5>Your vendor account is active</h5>
          <p>You can now add products and manage your store.</p>
          <button className="primary-btn" onClick={handleUpdateProfile}>
            Complete Profile
          </button>
        </div>
      </section>

      <section className="quick-actions">
        <h4>Quick Actions</h4>
        <div className="action-grid">
          <div className="action-card">
            <h5>Add Products</h5>
            <p>Start listing your products in the marketplace.</p>
            <button className="primary-btn" onClick={handleAddProduct}>
              Add Now
            </button>
          </div>
          <div className="action-card">
            <h5>Manage Inventory</h5>
            <p>View and update your product inventory.</p>
            <Link to="/vendor/product-inventory">
              <button className="primary-btn">Manage</button>
            </Link>
          </div>
          <div className="action-card">
            <h5>View ID Card</h5>
            <p>Access your vendor identification card with QR code.</p>
            <Link to="/vendor/id-card">
              <button className="primary-btn">View</button>
            </Link>
          </div>
        </div>
      </section>

      <section className="performance-overview">
        <h4>Performance Overview</h4>
        <div className="overview-grid">
          <div className="overview-card">
            <p>{stats.totalProducts}</p>
            <h6>Products</h6>
            <Link to="/vendor/product-inventory">
              <button className="view-btn">View Details</button>
            </Link>
          </div>
          <div className="overview-card">
            <p>{stats.totalOrders}</p>
            <h6>Orders</h6>
            <Link to="/vendor/orders">
              <button className="view-btn">View Details</button>
            </Link>
          </div>
          <div className="overview-card">
            <p>${stats.totalRevenue}</p>
            <h6>Revenue</h6>
            <Link to="/vendor/sales">
              <button className="view-btn">View Details</button>
            </Link>
          </div>
          <div className="overview-card">
            <p>{stats.totalInventory}</p>
            <h6>Total Inventory</h6>
            <Link to="/vendor/inventory">
              <button className="view-btn">View Details</button>
            </Link>
          </div>
        </div>
      </section>

      <section className="getting-started">
        <h4>Resources</h4>
        <ul>
          <li>
            <Link to="/vendor/guide">
              <span>📘</span> Vendor Guide <span className="arrow">→</span>
            </Link>
          </li>
          <li>
            <Link to="/vendor/photography-tips">
              <span>📷</span> Product Photography Tips <span className="arrow">→</span>
            </Link>
          </li>
          <li>
            <Link to="/vendor/pricing-strategies">
              <span>💸</span> Pricing Strategies <span className="arrow">→</span>
            </Link>
          </li>
        </ul>
      </section>
      
      <section className="recent-orders">
        <h4>Recent Orders</h4>
        {orders.length === 0 ? (
          <p className="no-data">No orders yet. Start adding products to your inventory.</p>
        ) : (
          <div className="table-container">
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
                {orders.slice(0, 5).map(order => (
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
                      <Link to={`/vendor/orders/${order.order_id}`}>
                        <button className="view-btn">View</button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default VendorDashboard;
