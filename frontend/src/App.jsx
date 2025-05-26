import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import VendiLogin from './components/Vendi/VendiLogin';
import VendiSignup from './components/Vendi/VendiSignup';
import Food from './components/Vendi/Food';
import NotFound from './pages/NotFound';
import HomeGarden from './components/Vendi/HomeGarden';
import HomeKitchen from './components/Vendi/HomeKitchen';
import './styles/global.css';

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/profile" element={<Profile />} />
              {/* Routes for Vendi (Customer) Authentication */}
              <Route path="/vendi/login" element={<VendiLogin />} />
              <Route path="/vendi/signup" element={<VendiSignup />} />
              {/* Route for Vendor Registration */}
              <Route path="/vendor/register" element={<VendiSignup />} />
              {/* Food Products Route */}
              <Route path="/vendi/food" element={<Food />} />
              <Route path="/vendi/home-garden" element={<HomeGarden />} />
              <Route path="/vendi/home-kitchen" element={<HomeKitchen />} />
              
              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App; 