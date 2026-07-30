import axiosInstance from '../api/axiosClient';

// ==========================================
// Authentication & User Services
// ==========================================
export const authService = {
  login: async (credentials) => await axiosInstance.post('/auth/login', credentials),
  register: async (userData) => await axiosInstance.post('/auth/register', userData),
  forgotPassword: async (email) => await axiosInstance.post('/auth/forgot-password', { email }),
  resetPassword: async (token, newPassword) => await axiosInstance.post('/auth/reset-password', { token, newPassword }),
  logout: () => {
    sessionStorage.removeItem('token');
    // window.location.href = '/login'; 
  }
};

export const userService = {
  getProfile: async () => await axiosInstance.get('/users/me'),
  updateProfile: async (userData) => await axiosInstance.put('/users/profile', userData),
  getFavorites: async () => await axiosInstance.get('/users/me/favorites'),
  getQuotations: async () => await axiosInstance.get('/users/me/quotations'),
  getPendingPayments: async () => await axiosInstance.get('/users/me/pending-payments'),
  getOrders: async () => await axiosInstance.get('/users/me/orders'),

  // Address Management (Section 6.2)
  getAddresses: async () => await axiosInstance.get('/users/me/addresses'),
  getAddressById: async (id) => await axiosInstance.get(`/users/me/addresses/${id}`),
  createAddress: async (addressData) => await axiosInstance.post('/users/me/addresses', addressData),
  // Note: PUT is a full replace, not PATCH. Always send complete address object.
  updateAddress: async (id, addressData) => await axiosInstance.put(`/users/me/addresses/${id}`, addressData),
  deleteAddress: async (id) => await axiosInstance.delete(`/users/me/addresses/${id}`),
  setDefaultAddress: async (id) => await axiosInstance.post(`/users/me/addresses/${id}/default`),

  // Tax Details Management (Section 6.3)
  getTaxDetails: async (addressId) => await axiosInstance.get(`/users/me/addresses/${addressId}/tax-details`),
  createTaxDetail: async (addressId, taxData) => await axiosInstance.post(`/users/me/addresses/${addressId}/tax-details`, taxData),
  updateTaxDetail: async (addressId, id, taxData) => await axiosInstance.put(`/users/me/addresses/${addressId}/tax-details/${id}`, taxData),
  deleteTaxDetail: async (addressId, id) => await axiosInstance.delete(`/users/me/addresses/${addressId}/tax-details/${id}`),
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
  getAllProducts: async (params) => await axiosInstance.get('/store/products', { params }),
  getProductById: async (id) => await axiosInstance.get(`/store/products/${id}`),

  // For filter sidebars
  getCategories: async (params) => await axiosInstance.get('/store/categories', { params }),
  getBrands: async () => await axiosInstance.get('/brands'),

  // Admin/Dashboard product management
  createProduct: async (productData) => await axiosInstance.post('/products', productData),
  updateProduct: async (id, productData) => await axiosInstance.put(`/products/${id}`, productData),
  deleteProduct: async (id) => await axiosInstance.delete(`/products/${id}`),
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

// ==========================================
// Public Category Services
// ==========================================
export const categoryPublicService = {
  listCategories: async (params) => await axiosInstance.get('/store/categories', { params }),
  getCategory: async (slugOrId) => await axiosInstance.get(`/store/categories/${slugOrId}`),
  getCategoryProducts: async (slug, params) => await axiosInstance.get(`/store/categories/${slug}/products`, { params }),
};

// ==========================================
// Admin Category Services
// ==========================================
export const categoryAdminService = {
  listCategories: async (params) => await axiosInstance.get('/admin/categories', { params }),
  getCategory: async (id) => await axiosInstance.get(`/admin/categories/${id}`),
  createCategory: async (categoryData) => await axiosInstance.post('/admin/categories', categoryData),
  updateCategory: async (id, categoryData) => await axiosInstance.patch(`/admin/categories/${id}`, categoryData),
  deleteCategory: async (id) => await axiosInstance.delete(`/admin/categories/${id}`),
};

// ==========================================
// Admin Segment Services (Placeholder)
// ==========================================
export const segmentAdminService = {
  createSegment: async (categoryId, segmentData) => await axiosInstance.post(`/admin/categories/${categoryId}/segments`, segmentData),
  updateSegment: async (categoryId, segmentId, segmentData) => await axiosInstance.patch(`/admin/categories/${categoryId}/segments/${segmentId}`, segmentData),
  deleteSegment: async (categoryId, segmentId) => await axiosInstance.delete(`/admin/categories/${categoryId}/segments/${segmentId}`),
};

// ==========================================
// Admin Attribute Services
// ==========================================
export const attributeAdminService = {
  createAttribute: async (categoryId, segmentId, attributeData) => await axiosInstance.post(`/admin/categories/${categoryId}/segments/${segmentId}/attributes`, attributeData),
  updateAttribute: async (categoryId, segmentId, attributeId, attributeData) => await axiosInstance.patch(`/admin/categories/${categoryId}/segments/${segmentId}/attributes/${attributeId}`, attributeData),
  deleteAttribute: async (categoryId, segmentId, attributeId) => await axiosInstance.delete(`/admin/categories/${categoryId}/segments/${segmentId}/attributes/${attributeId}`),
};

// ==========================================
// Public Product Services
// ==========================================
export const productPublicService = {
  listProducts: async (params) => await axiosInstance.get('/store/products', { params }),
  getProduct: async (slugOrId, params) => await axiosInstance.get(`/store/products/${slugOrId}`, { params }),
  getProductBySlug: async (slug, params) => await axiosInstance.get(`/store/products/${slug}`, { params }),
};

// ==========================================
// Admin Product Services (Phase 2 Placeholders)
// ==========================================
export const productAdminService = {
  listProducts: async (params) => await axiosInstance.get('/admin/products', { params }),
  getProduct: async (id) => await axiosInstance.get(`/admin/products/${id}`),
  createProduct: async (productData) => await axiosInstance.post('/admin/products', productData),
  updateProduct: async (id, productData) => await axiosInstance.patch(`/admin/products/${id}`, productData),
  deleteProduct: async (id) => await axiosInstance.delete(`/admin/products/${id}`),

  // Packaging
  addPackaging: async (productId, data) => await axiosInstance.post(`/admin/products/${productId}/packaging`, data),
  updatePackaging: async (productId, pkgId, data) => await axiosInstance.patch(`/admin/products/${productId}/packaging/${pkgId}`, data),
  deletePackaging: async (productId, pkgId) => await axiosInstance.delete(`/admin/products/${productId}/packaging/${pkgId}`),

  // Prices
  addPriceBreak: async (productId, pkgId, data) => await axiosInstance.post(`/admin/products/${productId}/packaging/${pkgId}/prices`, data),
  updatePriceBreak: async (productId, pkgId, priceId, data) => await axiosInstance.patch(`/admin/products/${productId}/packaging/${pkgId}/prices/${priceId}`, data),
  deletePriceBreak: async (productId, pkgId, priceId) => await axiosInstance.delete(`/admin/products/${productId}/packaging/${pkgId}/prices/${priceId}`),

  // Images
  addImage: async (productId, data) => await axiosInstance.post(`/admin/products/${productId}/images`, data),
  updateImage: async (productId, imageId, data) => await axiosInstance.patch(`/admin/products/${productId}/images/${imageId}`, data),
  deleteImage: async (productId, imageId) => await axiosInstance.delete(`/admin/products/${productId}/images/${imageId}`),

  // Documents
  addDocument: async (productId, data) => await axiosInstance.post(`/admin/products/${productId}/documents`, data),
  updateDocument: async (productId, docId, data) => await axiosInstance.patch(`/admin/products/${productId}/documents/${docId}`, data),
  deleteDocument: async (productId, docId) => await axiosInstance.delete(`/admin/products/${productId}/documents/${docId}`),
};

// ==========================================
// Admin Catalog Config Services (Placeholder)
// ==========================================
export const configAdminService = {
  getPackagingTypes: async () => await axiosInstance.get('/admin/catalog-config/packaging-types'),
  getCurrencies: async () => await axiosInstance.get('/admin/catalog-config/currencies'),
};

// ==========================================
// Admin Maintenance Services (Placeholder)
// ==========================================
export const maintenanceAdminService = {
  cleanupCategoryImages: async () => await axiosInstance.post('/admin/maintenance/category-images/cleanup'),
};

// ==========================================
// Admin Upload Services
// ==========================================
export const uploadAdminService = {
  presignUrl: async (data) => await axiosInstance.post('/admin/uploads/presign', data),
};
