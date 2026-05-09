import axiosInstance from '../api/axiosInstance';

// ==========================================
// Authentication & User Services
// ==========================================
export const authService = {
  login: async (credentials) => await axiosInstance.post('/auth/login', credentials),
  register: async (userData) => await axiosInstance.post('/auth/register', userData),
  forgotPassword: async (email) => await axiosInstance.post('/auth/forgot-password', { email }),
  resetPassword: async (token, newPassword) => await axiosInstance.post('/auth/reset-password', { token, newPassword }),
  logout: () => {
    localStorage.removeItem('token');
    // window.location.href = '/login'; 
  }
};

export const userService = {
  getProfile: async () => await axiosInstance.get('/users/profile'),
  updateProfile: async (userData) => await axiosInstance.put('/users/profile', userData),
};


// ==========================================
// Public / Storefront Services (Home.jsx)
// ==========================================
export const publicService = {
  // Fetch home page data like banners, featured products, categories showcases
  getHomeData: async () => await axiosInstance.get('/public/home'), 
};


// ==========================================
// Product & Catalog Services (ProductListing.jsx, ProductDetails.jsx)
// ==========================================
export const productService = {
  // Get products with filters (search, category, price min/max, sort, page, limit)
  getAllProducts: async (params) => await axiosInstance.get('/products', { params }),
  getProductById: async (id) => await axiosInstance.get(`/products/${id}`),
  
  // For filter sidebars
  getCategories: async () => await axiosInstance.get('/categories'),
  getBrands: async () => await axiosInstance.get('/brands'),
  
  // Admin/Dashboard product management
  createProduct: async (productData) => await axiosInstance.post('/products', productData),
  updateProduct: async (id, productData) => await axiosInstance.put(`/products/${id}`, productData),
  deleteProduct: async (id) => await axiosInstance.delete(`/products/${id}`),
};


// ==========================================
// Cart Services
// ==========================================
export const cartService = {
  getCart: async () => await axiosInstance.get('/cart'),
  addToCart: async (productId, quantity) => await axiosInstance.post('/cart/add', { productId, quantity }),
  updateCartItem: async (productId, quantity) => await axiosInstance.put('/cart/update', { productId, quantity }),
  removeFromCart: async (productId) => await axiosInstance.delete(`/cart/remove/${productId}`),
  clearCart: async () => await axiosInstance.delete('/cart/clear'),
};


// ==========================================
// Order Services
// ==========================================
export const orderService = {
  createOrder: async (orderData) => await axiosInstance.post('/orders', orderData),
  getUserOrders: async (params) => await axiosInstance.get('/orders/my-orders', { params }),
  getOrderById: async (id) => await axiosInstance.get(`/orders/${id}`),
  
  // Admin/Dashboard order management
  getAllOrders: async (params) => await axiosInstance.get('/orders', { params }),
  updateOrderStatus: async (id, statusData) => await axiosInstance.put(`/orders/${id}/status`, statusData),
};


// ==========================================
// Dashboard Services (DashboardHome.jsx)
// ==========================================
export const dashboardService = {
  // Get overview stats (total sales, total orders, active users, etc.)
  getStats: async () => await axiosInstance.get('/dashboard/stats'),
  
  // Get a list of recent orders to display in a table
  getRecentOrders: async () => await axiosInstance.get('/dashboard/recent-orders'),
  
  // Get products that are running low on inventory
  getLowStockAlerts: async () => await axiosInstance.get('/dashboard/low-stock'),
  
  // Get data for charts (e.g., sales over the last 7 days/30 days)
  getSalesChartData: async (range) => await axiosInstance.get('/dashboard/sales-chart', { params: { range } }),
};
