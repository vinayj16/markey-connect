import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.nav-user')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isUserMenuOpen]);

  // Handle logout
  const handleLogout = useCallback(() => {
    // TODO: Implement logout logic
    setIsUserMenuOpen(false);
    navigate('/login');
  }, [navigate]);

  // Check if a nav item is active
  const isActive = useCallback((path) => {
    return location.pathname === path;
  }, [location.pathname]);

  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  // Toggle user menu
  const toggleUserMenu = useCallback(() => {
    setIsUserMenuOpen(prev => !prev);
  }, []);

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`} role="banner">
      <nav className="nav" role="navigation">
        <Link to="/" className="nav-logo" aria-label="MarketConnect Home">
          MarketConnect
        </Link>

        <button
          className={`nav-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="nav-menu"
        >
          <span className="nav-toggle-icon"></span>
          <span className="nav-toggle-icon"></span>
          <span className="nav-toggle-icon"></span>
        </button>

        <div 
          id="nav-menu"
          className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}
          role="menu"
        >
          <Link 
            to="/" 
            className={`nav-item ${isActive('/') ? 'active' : ''}`}
            role="menuitem"
          >
            Home
          </Link>
          <Link 
            to="/products" 
            className={`nav-item ${isActive('/products') ? 'active' : ''}`}
            role="menuitem"
          >
            Products
          </Link>
          <Link 
            to="/categories" 
            className={`nav-item ${isActive('/categories') ? 'active' : ''}`}
            role="menuitem"
          >
            Categories
          </Link>
          <Link 
            to="/about" 
            className={`nav-item ${isActive('/about') ? 'active' : ''}`}
            role="menuitem"
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className={`nav-item ${isActive('/contact') ? 'active' : ''}`}
            role="menuitem"
          >
            Contact
          </Link>
        </div>

        <div className="nav-actions">
          <Link 
            to="/cart" 
            className="nav-cart"
            aria-label={`View cart (${cartCount} items)`}
          >
            <span className="nav-cart-icon" aria-hidden="true">🛒</span>
            {cartCount > 0 && (
              <span className="badge" aria-label={`${cartCount} items in cart`}>
                {cartCount}
              </span>
            )}
          </Link>

          <div className="nav-user">
            <button
              className="nav-user-button"
              onClick={toggleUserMenu}
              aria-label="Open user menu"
              aria-expanded={isUserMenuOpen}
              aria-controls="user-dropdown"
            >
              <span className="avatar" aria-hidden="true">U</span>
            </button>

            {isUserMenuOpen && (
              <div 
                id="user-dropdown"
                className="dropdown"
                role="menu"
              >
                <div className="dropdown-content">
                  <Link 
                    to="/profile" 
                    className="dropdown-item"
                    role="menuitem"
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/orders" 
                    className="dropdown-item"
                    role="menuitem"
                  >
                    Orders
                  </Link>
                  <div className="dropdown-divider" role="separator"></div>
                  <button
                    className="dropdown-item"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header; 