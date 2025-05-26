import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vendorToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vendorToken');
      localStorage.removeItem('vendorInfo');
      window.location.href = '/vendor/login';
    }
    return Promise.reject(error);
  }
);

// Auth helpers
export const isVendorLoggedIn = () => {
  return !!localStorage.getItem('vendorToken');
};

export const logout = (type = 'vendor') => {
  if (type === 'vendor') {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendorInfo');
  }
};

// Vendor API
export const vendorAPI = {
  // Auth endpoints
  register: async (vendorData) => {
    try {
      const response = await api.post('/vendors/signup', vendorData);
      return response;
    } catch (error) {
      console.error('Error registering vendor:', error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/vendors/login', credentials);
      return response;
    } catch (error) {
      console.error('Error logging in vendor:', error);
      throw error;
    }
  },

  // Profile endpoints
  getProfile: async () => {
    try {
      const response = await api.get('/vendors/profile');
      return response;
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/vendors/profile', profileData);
      return response;
    } catch (error) {
      console.error('Error updating vendor profile:', error);
      throw error;
    }
  },

  // Product endpoints
  getProducts: async () => {
    try {
      const response = await api.get('/vendors/products');
      return response;
    } catch (error) {
      console.error('Error fetching vendor products:', error);
      throw error;
    }
  },

  addProduct: async (productData) => {
    try {
      const response = await api.post('/vendors/products', productData);
      return response;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },

  updateProduct: async (productId, productData) => {
    try {
      const response = await api.put(`/vendors/products/${productId}`, productData);
      return response;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  deleteProduct: async (productId) => {
    try {
      const response = await api.delete(`/vendors/products/${productId}`);
      return response;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Order endpoints
  getOrders: async () => {
    try {
      const response = await api.get('/vendors/orders');
      return response;
    } catch (error) {
      console.error('Error fetching vendor orders:', error);
      throw error;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.put(`/vendors/orders/${orderId}`, { status });
      return response;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
};

// Customer API
export const customerAPI = {
  // Product related endpoints
  getAllProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  getProductById: async (productId) => {
    try {
      const response = await api.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Cart related endpoints
  getCart: async () => {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  addToCart: async ({ productId, quantity }) => {
    try {
      const response = await api.post('/cart/items', { productId, quantity });
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  updateCartItem: async ({ itemId, quantity }) => {
    try {
      const response = await api.put(`/cart/items/${itemId}`, { quantity });
      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  removeFromCart: async (itemId) => {
    try {
      const response = await api.delete(`/cart/items/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  // Order related endpoints
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  getOrders: async () => {
    try {
      const response = await api.get('/orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Authentication endpoints
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      localStorage.removeItem('customerToken');
      return response.data;
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  // User profile endpoints
  getProfile: async () => {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Address management endpoints
  getAddresses: async () => {
    try {
      const response = await api.get('/addresses');
      return response.data;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  },

  addAddress: async (addressData) => {
    try {
      const response = await api.post('/addresses', addressData);
      return response.data;
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  },

  updateAddress: async ({ addressId, addressData }) => {
    try {
      const response = await api.put(`/addresses/${addressId}`, addressData);
      return response.data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  },

  deleteAddress: async (addressId) => {
    try {
      const response = await api.delete(`/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }
};

export default api;



