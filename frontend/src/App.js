import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import './styles/global.css';
import './styles/theme.css';
import './styles/vendor-shared.css';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import ToastContainer from './components/common/ToastContainer';

// General Pages
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';

// Vendor Pages
import VendorHome from './pages/vendor/VendorHome';
import VendorRegister from './pages/vendor/VendorRegister';
import VendorLogin from './pages/vendor/VendorLogin';
import VendorDashboard from './pages/vendor/VendorDashboard';

// Vendi (User) Pages
import VendiLogin from './pages/vendi/VendiLogin';
import SignUp from './pages/vendi/VendiSignup';
import ProductListing from './pages/vendi/ProductDiscovery';
import Cart from './pages/vendi/Cart';
import VendiDashboard from './pages/vendi/Dashboard';
import ProfileSettings from './pages/vendi/ProfileSettings';
import DiscoverProducts from './pages/vendi/DiscoverProducts';
import AllProducts from './pages/vendi/AllProducts';
import SportsOutdoor from './pages/vendi/SportsOutdoor';
import ClothingCollection from './pages/vendi/ClothingCollection';
import Electronics from './pages/vendi/Electronics';
import HomeGarden from './pages/vendi/HomeGarden';
import Beauty from './pages/vendi/Beauty';
import Food from './pages/vendi/Food';
import Checkout from './pages/vendi/Checkout';
import ReturnRequest from './pages/vendi/ReturnRequest';
import OrderConfirmation from './pages/vendi/OrderConfirmation';
import TrackingDetails from './pages/vendi/TrackingDetails';
import OrderReview from './pages/vendi/OrderReview';
import ProductDetail from './pages/shared/ProductDetail';

// Support Pages
import EmailSupport from './pages/support/EmailSupport';
import SubmitTicket from './pages/support/SubmitTicket';
import TicketSuccess from './pages/support/TicketSuccess';

// Error Pages
import NotFound from './pages/error/NotFound';
import ErrorDemo from './pages/error/ErrorDemo';

// Create a component that uses useNavigate
const AppRoutes = () => {
  const navigate = useNavigate();
  
  return (
    <ErrorBoundary 
      navigate={navigate}
      componentName="AppRoutes"
      customMessage="Something went wrong in the application"
    >
      <Layout>
        <Routes>
          {/* General Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/error-demo" element={<ErrorDemo />} />

          {/* Vendor Routes */}
          <Route path="/vendor" element={<VendorHome />} />
          <Route path="/vendor/register" element={<VendorRegister />} />
          <Route path="/vendor/login" element={<VendorLogin />} />
          <Route 
            path="/vendor/dashboard" 
            element={
              <ProtectedRoute role="vendor">
                <VendorDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Vendi (User) Routes */}
          <Route path="/vendi/login" element={<VendiLogin />} />
          <Route path="/vendi/signup" element={<SignUp />} />
          <Route 
            path="/vendi/dashboard" 
            element={
              <ProtectedRoute role="user">
                <VendiDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vendi/profile" 
            element={
              <ProtectedRoute role="user">
                <ProfileSettings />
              </ProtectedRoute>
            } 
          />
          <Route path="/vendi/discover" element={<DiscoverProducts />} />
          <Route path="/vendi/products" element={<ProductListing />} />
          <Route path="/vendi/products/all" element={<AllProducts />} />
          <Route path="/vendi/products/sports-outdoor" element={<SportsOutdoor />} />
          <Route path="/vendi/products/clothing" element={<ClothingCollection />} />
          <Route path="/vendi/products/electronics" element={<Electronics />} />
          <Route path="/vendi/products/home-garden" element={<HomeGarden />} />
          <Route path="/vendi/products/beauty" element={<Beauty />} />
          <Route path="/vendi/products/food" element={<Food />} />
          <Route path="/vendi/cart" element={<Cart />} />
          <Route 
            path="/vendi/checkout" 
            element={
              <ProtectedRoute role="user">
                <Checkout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vendi/order-confirmation" 
            element={
              <ProtectedRoute role="user">
                <OrderConfirmation />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vendi/order-review" 
            element={
              <ProtectedRoute role="user">
                <OrderReview />
              </ProtectedRoute>
            } 
          />
          <Route path="/vendi/product/:id" element={<ProductDetail />} />
          <Route 
            path="/vendi/tracking/:orderId" 
            element={
              <ProtectedRoute role="user">
                <TrackingDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vendi/return-request" 
            element={
              <ProtectedRoute role="user">
                <ReturnRequest />
              </ProtectedRoute>
            } 
          />

          {/* Support Routes */}
          <Route path="/support/email" element={<EmailSupport />} />
          <Route path="/support/ticket" element={<SubmitTicket />} />
          <Route path="/support/ticket/success" element={<TicketSuccess />} />

          {/* 404 - Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <Router>
                <AppRoutes />
                <ToastContainer />
                <LoadingSpinner />
              </Router>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
