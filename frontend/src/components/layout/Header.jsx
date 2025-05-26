import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <nav className="nav-container">
        <div className="nav-left">
          <Link to="/" className="logo">
            MarketConnect
          </Link>
        </div>
        
        <div className="nav-center">
          <Link to="/products" className="nav-link">All Products</Link>
          <Link to="/vendi/food" className="nav-link">Food & Groceries</Link>
          <Link to="/products/electronics" className="nav-link">Electronics</Link>
          <Link to="/products/fashion" className="nav-link">Fashion</Link>
          <Link to="/products/home" className="nav-link">Home & Kitchen</Link>
        </div>
        
        <div className="nav-right">
          <Link to="/cart" className="nav-link">
            <i className="fas fa-shopping-cart"></i>
            Cart
          </Link>
          <Link to="/vendi/login" className="nav-link">Login</Link>
          <Link to="/vendi/signup" className="btn btn-primary">Sign Up</Link>
        </div>
      </nav>
    </header>
  );
};

export default Header; 