import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// General Pages
import Home from './components/Home';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import NotFound from './components/NotFound';

// Vendor Pages
import VendorHome from './components/Vendor/VendorHome';
import VendorRegister from './components/Vendor/VendorRegister';
import VendorLogin from './components/Vendor/VendorLogin';
import VendorDashboard from './components/Vendor/VendorDashboard';

// Vendi (User) Pages
import VendiLogin from './components/Vendi/VendiLogin';
import SignUp from './components/Vendi/VendiSignup';
import ProductListing from './components/Vendi/ProductDiscovery';
import Cart from './components/Vendi/Cart';
import VendiDashboard from './components/Vendi/Dashboard';
import ProfileSettings from './components/Vendi/ProfileSettings';
import DiscoverProducts from './components/Vendi/DiscoverProducts';
import AllProducts from './components/Vendi/AllProducts';
import SportsOutdoor from './components/Vendi/SportsOutdoor';
import ClothingCollection from './components/Vendi/ClothingCollection';
import Electronics from './components/Vendi/Electronics';
import HomeGarden from './components/Vendi/HomeGarden';
import Beauty from './components/Vendi/Beauty';
import Food from './components/Vendi/Food';
import Checkout from './components/Vendi/Checkout';
import CheckoutPayment from './components/Vendi/CheckoutPayment';
import ReturnRequest from './components/Vendi/ReturnRequest';
import OrderConfirmation from './components/Vendi/OrderConfirmation';
import TrackingDetails from './components/Vendi/TrackingDetails';
import OrderReview from './components/Vendi/OrderReview';
import ProductDetail from './components/shared/ProductDetail';

// Support Pages
import EmailSupport from './components/EmailSupport';
import SubmitTicket from './components/SubmitTicket';
import TicketSuccess from './components/TicketSuccess';

// Auth Guards
import { isVendorLoggedIn, isCustomerLoggedIn } from './utils/api';

// Protected Route Components
const VendorProtectedRoute = ({ children }) => {
  return isVendorLoggedIn() ? children : <Navigate to="/vendor/login" />;
};

const CustomerProtectedRoute = ({ children }) => {
  return isCustomerLoggedIn() ? children : <Navigate to="/vendi/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* General Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<ContactUs />} />

      {/* Vendor Routes */}
      <Route path="/vendor" element={<VendorHome />} />
      <Route path="/vendor/register" element={<VendorRegister />} />
      <Route path="/vendor/login" element={<VendorLogin />} />
      <Route 
        path="/vendor/dashboard" 
        element={
          <VendorProtectedRoute>
            <VendorDashboard />
          </VendorProtectedRoute>
        } 
      />

      {/* Vendi (User) Routes */}
      <Route path="/vendi/login" element={<VendiLogin />} />
      <Route path="/vendi/signup" element={<SignUp />} />
      
      {/* Public Product Routes */}
      <Route path="/vendi/products/all" element={<AllProducts />} />
      <Route path="/vendi/products/discover" element={<DiscoverProducts />} />
      <Route path="/vendi/products/sports-outdoor" element={<SportsOutdoor />} />
      <Route path="/vendi/products/clothing" element={<ClothingCollection />} />
      <Route path="/vendi/products/electronics" element={<Electronics />} />
      <Route path="/vendi/products/home-garden" element={<HomeGarden />} />
      <Route path="/vendi/products/beauty" element={<Beauty />} />
      <Route path="/vendi/products/food" element={<Food />} />
      <Route path="/vendi/products" element={<ProductListing />}>
        <Route index element={<Navigate to="all" replace />} />
      </Route>
      <Route path="/vendi/product/:id" element={<ProductDetail />} />
      
      {/* Protected Customer Routes */}
      <Route 
        path="/vendi/cart" 
        element={
          <CustomerProtectedRoute>
            <Cart />
          </CustomerProtectedRoute>
        } 
      />
      <Route 
        path="/vendi/dashboard" 
        element={
          <CustomerProtectedRoute>
            <VendiDashboard />
          </CustomerProtectedRoute>
        } 
      />
      <Route 
        path="/vendi/profile-settings" 
        element={
          <CustomerProtectedRoute>
            <ProfileSettings />
          </CustomerProtectedRoute>
        } 
      />
      <Route 
        path="/vendi/checkout" 
        element={
          <CustomerProtectedRoute>
            <Checkout />
          </CustomerProtectedRoute>
        } 
      />
      <Route 
        path="/vendi/checkout/payment" 
        element={
          <CustomerProtectedRoute>
            <CheckoutPayment />
          </CustomerProtectedRoute>
        } 
      />
      <Route 
        path="/vendi/return-request" 
        element={
          <CustomerProtectedRoute>
            <ReturnRequest />
          </CustomerProtectedRoute>
        } 
      />
      <Route 
        path="/vendi/order-confirmation/:orderId" 
        element={
          <CustomerProtectedRoute>
            <OrderConfirmation />
          </CustomerProtectedRoute>
        } 
      />
      <Route 
        path="/vendi/tracking-details/:orderId" 
        element={
          <CustomerProtectedRoute>
            <TrackingDetails />
          </CustomerProtectedRoute>
        } 
      />
      <Route 
        path="/vendi/order-review/:orderId" 
        element={
          <CustomerProtectedRoute>
            <OrderReview />
          </CustomerProtectedRoute>
        } 
      />

      {/* Support Routes */}
      <Route path="/email-support" element={<EmailSupport />} />
      <Route path="/submit-ticket" element={<SubmitTicket />} />
      <Route path="/ticket-success" element={<TicketSuccess />} />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes; 