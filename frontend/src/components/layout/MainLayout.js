import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout, isVendorLoggedIn, isCustomerLoggedIn } from '../../utils/api';
import { 
  FiMenu, 
  FiX, 
  FiSearch, 
  FiUser, 
  FiLogOut, 
  FiSettings, 
  FiHome, 
  FiShoppingCart, 
  FiPackage, 
  FiDollarSign, 
  FiShoppingBag, 
  FiGrid,
  FiUserPlus
} from 'react-icons/fi';
import '../../styles/theme.css';
import './MainLayout.css';

const MainLayout = ({ children, userType = 'guest', pageTitle, showSearchBar = false, showContainer = true, requireAuth = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const vendorToken = localStorage.getItem('vendorToken');
      const customerToken = localStorage.getItem('customerToken');
      
      if ((userType === 'vendor' && vendorToken) || 
          (userType === 'customer' && customerToken) ||
          userType === 'guest') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        // Redirect to appropriate login if not authenticated
        if (requireAuth) {
          navigate(userType === 'vendor' ? '/vendor/login' : '/vendi/login', {
            state: { from: location.pathname }
          });
        }
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, [userType, location.pathname, requireAuth]);
  
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // If authentication is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
  }
  const navigate = useNavigate();
  const location = useLocation();
  const isVendor = userType === 'vendor' || isVendorLoggedIn();
  const isCustomer = userType === 'customer' || isCustomerLoggedIn();
  
  // State for dropdown menus
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Refs for dropdown menus
  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      if (isVendor) {
        await logout('vendor');
        navigate('/vendor/login');
      } else if (isCustomer) {
        await logout('customer');
        navigate('/vendi/login');
      } else {
        navigate('/');
      }
      // Clear local state and reload to reset everything
      setIsAuthenticated(false);
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect even if logout API fails
      localStorage.clear();
      window.location.href = '/';
    }
  };
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Toggle user dropdown
  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && 
          event.target.className !== 'mobile-menu-toggle' && 
          !event.target.closest('.mobile-menu-toggle')) {
        setMobileMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Close dropdowns when changing routes
  useEffect(() => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    const searchInput = e.target.elements.search?.value;
    if (searchInput?.trim()) {
      navigate(`/${isVendor ? 'vendor' : 'vendi'}/search?q=${encodeURIComponent(searchInput)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                MarketConnect
              </span>
            </Link>
            
            {showSearchBar && (
              <form className="flex-1 max-w-2xl px-6" onSubmit={handleSearch}>
                <div className="relative">
                  <input 
                    type="text" 
                    name="search" 
                    className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Search products..." 
                    aria-label="Search products"
                  />
                  <button 
                    type="submit" 
                    className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-gray-400 hover:text-gray-600"
                    aria-label="Search"
                  >
                    <FiSearch className="h-5 w-5" />
                  </button>
                </div>
              </form>
            )}
            
            <button 
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 mobile-menu-toggle"
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
            
            <nav className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block`} ref={mobileMenuRef}>
              <ul className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 lg:space-x-6">
                <li>
                  <Link 
                    to="/" 
                    className={`flex items-center py-2 px-3 rounded-md ${location.pathname === '/' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiHome className="mr-2 h-5 w-5" />
                    Home
                  </Link>
                </li>
                
                {isVendor && (
                  <>
                    <li>
                      <Link 
                        to="/vendor/dashboard" 
                        className={`flex items-center py-2 px-3 rounded-md ${location.pathname.startsWith('/vendor/dashboard') ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FiGrid className="mr-2 h-5 w-5" />
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/vendor/products" 
                        className={`flex items-center py-2 px-3 rounded-md ${location.pathname.startsWith('/vendor/products') ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FiPackage className="mr-2 h-5 w-5" />
                        My Products
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/vendor/orders" 
                        className={`flex items-center py-2 px-3 rounded-md ${location.pathname.startsWith('/vendor/orders') ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FiDollarSign className="mr-2 h-5 w-5" />
                        Orders
                      </Link>
                    </li>
                  </>
                )}
                
                {isCustomer && (
                  <>
                    <li>
                      <Link 
                        to="/vendi/products/all" 
                        className={`flex items-center py-2 px-3 rounded-md ${location.pathname.startsWith('/vendi/products') ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FiShoppingBag className="mr-2 h-5 w-5" />
                        Shop
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/vendi/cart" 
                        className={`flex items-center py-2 px-3 rounded-md ${location.pathname.startsWith('/vendi/cart') ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FiShoppingCart className="mr-2 h-5 w-5" />
                        Cart
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/vendi/orders" 
                        className={`flex items-center py-2 px-3 rounded-md ${location.pathname.startsWith('/vendi/orders') ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FiPackage className="mr-2 h-5 w-5" />
                        My Orders
                      </Link>
                    </li>
                  </>
                )}
                
                {!isVendor && !isCustomer && (
                  <>
                    <li className="relative">
                      <div 
                        className="flex items-center justify-between py-2 px-3 rounded-md text-gray-700 hover:bg-gray-50 hover:text-primary-600 cursor-pointer"
                        onClick={toggleCategories}
                      >
                        <div className="flex items-center">
                          <FiShoppingBag className="mr-2 h-5 w-5" />
                          <span>Browse Products</span>
                        </div>
                        {categoriesOpen ? <FiChevronUp className="ml-2" /> : <FiChevronDown className="ml-2" />}
                      </div>
                      {categoriesOpen && (
                        <div className="absolute left-0 mt-1 w-56 bg-white rounded-md shadow-lg z-50">
                          <Link
                            to="/vendi/products/all"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setCategoriesOpen(false);
                            }}
                          >
                            All Products
                          </Link>
                          <Link
                            to="/vendi/products/clothing"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setCategoriesOpen(false);
                            }}
                          >
                            👕 Clothing
                          </Link>
                          <Link
                            to="/vendi/products/electronics"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setCategoriesOpen(false);
                            }}
                          >
                            📱 Electronics
                          </Link>
                          <Link
                            to="/vendi/products/home-garden"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setCategoriesOpen(false);
                            }}
                          >
                            🏠 Home & Garden
                          </Link>
                          <Link
                            to="/vendi/products/beauty"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setCategoriesOpen(false);
                            }}
                          >
                            💄 Beauty
                          </Link>
                          <Link
                            to="/vendi/products/food"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setCategoriesOpen(false);
                            }}
                          >
                            🍎 Food
                          </Link>
                        </div>
                      )}
                    </li>
                    <li className="md:hidden">
                      <Link 
                        to="/vendi/register" 
                        className="flex items-center py-2 px-3 rounded-md text-primary-600 hover:bg-gray-50 font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FiUserPlus className="mr-2 h-5 w-5" />
                        Sign Up
                      </Link>
                    </li>
                    <li className="md:hidden">
                      <Link 
                        to="/vendi/login" 
                        className="flex items-center py-2 px-3 rounded-md text-gray-700 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FiLogIn className="mr-2 h-5 w-5" />
                        Log In
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>
            
            <div className="flex items-center space-x-4">
              {isVendor || isCustomer ? (
                <div className="relative" ref={userDropdownRef}>
                  <button 
                    onClick={toggleUserDropdown}
                    className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 text-primary-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="true"
                  >
                    <span>{(isVendor ? 'V' : 'C').toUpperCase()}</span>
                  </button>
                  
                  {userDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50 divide-y divide-gray-100"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu"
                    >
                      <div className="px-4 py-3">
                        <p className="text-sm text-gray-700">
                          {isVendor ? 'Vendor Account' : 'Customer Account'}
                        </p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {isVendor ? 'Vendor Name' : 'Customer Name'}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          to={isVendor ? "/vendor/dashboard" : "/vendi/dashboard"}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <FiGrid className="mr-3 h-4 w-4" />
                          Dashboard
                        </Link>
                        <Link
                          to={isVendor ? "/vendor/profile" : "/vendi/profile"}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <FiUser className="mr-3 h-4 w-4" />
                          My Profile
                        </Link>
                        <Link
                          to={isVendor ? "/vendor/settings" : "/vendi/settings"}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <FiSettings className="mr-3 h-4 w-4" />
                          Settings
                        </Link>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <FiLogOut className="mr-3 h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link 
                    to={isVendor ? "/vendor/login" : "/vendi/login"} 
                    className="hidden md:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Log In
                  </Link>
                  <Link 
                    to={isVendor ? "/vendor/register" : "/vendi/register"} 
                    className="hidden md:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Sign Up
                  </Link>
                </>
              )}
              
              <button 
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500" 
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {isVendor ? (
                <>
                  <Link 
                    to="/vendor/dashboard" 
                    className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiGrid className="mr-3 h-5 w-5 text-gray-500" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/vendor/products" 
                    className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiPackage className="mr-3 h-5 w-5 text-gray-500" />
                    My Products
                  </Link>
                  <Link 
                    to="/vendor/orders" 
                    className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiDollarSign className="mr-3 h-5 w-5 text-gray-500" />
                    Orders
                  </Link>
                  <Link 
                    to="/vendor/profile" 
                    className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiUser className="mr-3 h-5 w-5 text-gray-500" />
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center px-3 py-2.5 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    <FiLogOut className="mr-3 h-5 w-5" />
                    Sign Out
                  </button>
                </>
              ) : isCustomer ? (
                <>
                  <Link 
                    to="/vendi/dashboard" 
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                    onClick={toggleMobileMenu}
                  >
                    <FiHome className="mr-3 h-5 w-5" />
                    Home
                  </Link>
                  <Link 
                    to="/vendi/products/all" 
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                    onClick={toggleMobileMenu}
                  >
                    <FiShoppingBag className="mr-3 h-5 w-5 text-gray-500" />
                    Shop
                  </Link>
                  <Link 
                    to="/vendi/cart" 
                    className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiShoppingCart className="mr-3 h-5 w-5 text-gray-500" />
                    Cart
                  </Link>
                  <Link 
                    to="/vendi/orders" 
                    className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiPackage className="mr-3 h-5 w-5 text-gray-500" />
                    My Orders
                  </Link>
                  <Link 
                    to="/vendi/profile" 
                    className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiUser className="mr-3 h-5 w-5 text-gray-500" />
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center px-3 py-2.5 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    <FiLogOut className="mr-3 h-5 w-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/" 
                    className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiHome className="mr-3 h-5 w-5 text-gray-500" />
                    Home
                  </Link>
                  <Link 
                    to="/vendi/products/all" 
                    className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiShoppingBag className="mr-3 h-5 w-5 text-gray-500" />
                    Browse Products
                  </Link>
                  <Link 
                    to="/vendor/register" 
                    className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-primary-600 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiUserPlus className="mr-3 h-5 w-5" />
                    Sell on MarketConnect
                  </Link>
                  <div className="pt-2 border-t border-gray-200 mt-2 space-y-2">
                    <Link 
                      to="/vendi/login" 
                      className="block w-full px-4 py-2.5 text-base font-medium text-center text-primary-700 hover:bg-gray-50 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Log In
                    </Link>
                    <Link 
                      to="/vendi/register" 
                      className="block w-full px-4 py-2.5 text-base font-medium text-center text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Create Account
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
      </header>
      <main className="main-content">
        {pageTitle && (
          <div className="page-header">
            <div className="container">
              <h1 className="page-title">{pageTitle}</h1>
            </div>
          </div>
        )}
        
        {showContainer ? (
          <div className="container">
            {children}
          </div>
        ) : (
          children
        )}
      </main>
      
      <footer className="main-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>MarketConnect</h3>
              <p>Your one-stop shop for connecting vendors and customers in a seamless marketplace experience.</p>
            </div>
            
            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Connect With Us</h3>
              <div className="social-links">
                <a href="#" aria-label="Facebook">Facebook</a>
                <a href="#" aria-label="Twitter">Twitter</a>
                <a href="#" aria-label="Instagram">Instagram</a>
                <a href="#" aria-label="LinkedIn">LinkedIn</a>
              </div>
            </div>
            
            <div className="footer-section">
              <h3>Newsletter</h3>
              <form className="newsletter-form">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  aria-label="Your email address" 
                  required 
                />
                <button type="submit" aria-label="Subscribe">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} MarketConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
