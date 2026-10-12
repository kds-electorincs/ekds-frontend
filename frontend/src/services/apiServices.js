import axiosInstance from '../api/axiosClient';

// ==========================================
// Authentication & User Services
// ==========================================
export const authService = {
  login: async (credentials) => await axiosInstance.post('/auth/login', credentials),
  register: async (userData) => await axiosInstance.post('/auth/register', userData),
  forgotPassword: async (email) => await axiosInstance.post('/auth/password-reset/request', { email }),
  requestPasswordReset: async (email) => await axiosInstance.post('/auth/password-reset/request', { email }),
  resetPassword: async (data) => await axiosInstance.post('/auth/password-reset/verify', typeof data === 'string' ? JSON.parse(data) : data),
  verifyPasswordReset: async (data) => await axiosInstance.post('/auth/password-reset/verify', data),
  googleLogin: async (data) => await axiosInstance.post('/auth/google', typeof data === 'string' ? { idToken: data } : data),
  previewInvitation: async (token) => await axiosInstance.get(`/auth/invitations/${token}`),
  acceptInvitation: async (token, data) => await axiosInstance.post(`/auth/invitations/${token}/accept`, data),
  logout: async () => {
    try {
      const refreshToken = sessionStorage.getItem('refreshToken');
      await axiosInstance.post('/auth/logout', { refreshToken });
    } catch (err) {
      console.warn('Backend logout invalidation failed:', err?.message);
    } finally {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
    }
  }
};

export const userService = {
  getProfile: async () => await axiosInstance.get('/users/me'),
  updateProfile: async (userData) => await axiosInstance.put('/users/profile', userData),
  getFavorites: async () => await axiosInstance.get('/users/me/favorites'),
  getQuotations: async () => await axiosInstance.get('/users/me/quotations'),
  getPendingPayments: async () => await axiosInstance.get('/users/me/pending-payments'),
  getOrders: async () => await axiosInstance.get('/users/me/orders'),

  // Address Management
  getAddresses: async () => await axiosInstance.get('/users/me/addresses'),
  getAddressById: async (id) => await axiosInstance.get(`/users/me/addresses/${id}`),
  createAddress: async (addressData) => await axiosInstance.post('/users/me/addresses', addressData),
  updateAddress: async (id, addressData) => await axiosInstance.put(`/users/me/addresses/${id}`, addressData),
  deleteAddress: async (id) => await axiosInstance.delete(`/users/me/addresses/${id}`),
  setDefaultAddress: async (id) => await axiosInstance.post(`/users/me/addresses/${id}/default`),

  // Tax Details Management
  getTaxDetails: async (addressId) => await axiosInstance.get(`/users/me/addresses/${addressId}/tax-details`),
  createTaxDetail: async (addressId, taxData) => await axiosInstance.post(`/users/me/addresses/${addressId}/tax-details`, taxData),
  updateTaxDetail: async (addressId, id, taxData) => await axiosInstance.put(`/users/me/addresses/${addressId}/tax-details/${id}`, taxData),
  deleteTaxDetail: async (addressId, id) => await axiosInstance.delete(`/users/me/addresses/${addressId}/tax-details/${id}`),
};

// ==========================================
// Public / Storefront Services
// ==========================================
export const publicService = {
  getHomeData: async () => await axiosInstance.get('/public/home'),
};

// ==========================================
// Product & Catalog Services
// ==========================================
export const productService = {
  getAllProducts: async (params) => await axiosInstance.get('/store/products', { params }),
  getProductById: async (id) => await axiosInstance.get(`/store/products/${id}`),
  getCategories: async (params) => await axiosInstance.get('/store/categories', { params }),
  getBrands: async () => await axiosInstance.get('/brands'),
  createProduct: async (productData) => await axiosInstance.post('/products', productData),
  updateProduct: async (id, productData) => await axiosInstance.put(`/products/${id}`, productData),
  deleteProduct: async (id) => await axiosInstance.delete(`/products/${id}`),
};

// ==========================================
// Order Services
// ==========================================
export const orderService = {
  createOrder: async (orderData, currency = 'INR') =>
    await axiosInstance.post('/orders', orderData, { params: { currency } }),
  getUserOrders: async (params) => await axiosInstance.get('/orders', { params }),
  getOrderById: async (orderNumber) => await axiosInstance.get(`/orders/${orderNumber}`),
};

// ==========================================
// Admin Order Management Services
// ==========================================
export const adminOrderService = {
  listOrders: async (params) => await axiosInstance.get('/admin/orders', { params }),
  getOrder: async (id) => await axiosInstance.get(`/admin/orders/${id}`),
  updateStatus: async (id, status, note) =>
    await axiosInstance.post(`/admin/orders/${id}/status`, { status, note }),
  shipOrder: async (id, courierName, awbNumber) =>
    await axiosInstance.post(`/admin/orders/${id}/ship`, { courierName, awbNumber }),
};

// ==========================================
// Admin Payment Reconciliation Services
// ==========================================
export const adminPaymentService = {
  getMismatches: async (page = 0, size = 20) => {
    const params = typeof page === 'object' ? page : { page, size };
    return await axiosInstance.get('/admin/payments/mismatches', { params });
  },
  resolveMismatch: async (id, resolutionNote) =>
    await axiosInstance.post(`/admin/payments/mismatches/${id}/resolve`, { resolutionNote }),
};

// ==========================================
// Admin Delivery Rates Services (FINANCE permission)
// ==========================================
export const deliveryRatesAdminService = {
  getDeliveryRates: async () => await axiosInstance.get('/admin/delivery-rates'),
  updateDeliveryRate: async (zone, ratePerKgRupees) =>
    await axiosInstance.put(`/admin/delivery-rates/${zone}`, { ratePerKgRupees }),
};

// ==========================================
// Dashboard Services
// ==========================================
export const dashboardService = {
  getStats: async () => await axiosInstance.get('/dashboard/stats'),
  getRecentOrders: async () => await axiosInstance.get('/dashboard/recent-orders'),
  getLowStockAlerts: async () => await axiosInstance.get('/dashboard/low-stock'),
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
// Admin Segment Services
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
  getSupportedCurrencies: async () => await axiosInstance.get('/store/products/currencies'),
};

// ==========================================
// Cart Services
// ==========================================
export const cartService = {
  getCart: async (currency = 'INR', stateCode = null) => {
    const params = { currency };
    if (stateCode) params.stateCode = stateCode;
    return await axiosInstance.get('/cart', { params });
  },
  addItem: async (packagingOptionId, quantity) =>
    await axiosInstance.post('/cart/items', { packagingOptionId, quantity }),
  updateItem: async (packagingOptionId, quantity) =>
    await axiosInstance.patch(`/cart/items/${packagingOptionId}`, { quantity }),
  removeItem: async (packagingOptionId) =>
    await axiosInstance.delete(`/cart/items/${packagingOptionId}`),
  clearCart: async () =>
    await axiosInstance.delete('/cart'),
};

// ==========================================
// Admin Product Services
// ==========================================
export const productAdminService = {
  listProducts: async (params) => await axiosInstance.get('/admin/products', { params }),
  getProduct: async (id) => await axiosInstance.get(`/admin/products/${id}`),
  createProduct: async (productData) => await axiosInstance.post('/admin/products', productData),
  updateProduct: async (id, productData) => await axiosInstance.patch(`/admin/products/${id}`, productData),
  deleteProduct: async (id) => await axiosInstance.delete(`/admin/products/${id}`),

  addPackaging: async (productId, data) => await axiosInstance.post(`/admin/products/${productId}/packaging`, data),
  updatePackaging: async (productId, pkgId, data) => await axiosInstance.patch(`/admin/products/${productId}/packaging/${pkgId}`, data),
  deletePackaging: async (productId, pkgId) => await axiosInstance.delete(`/admin/products/${productId}/packaging/${pkgId}`),

  addPriceBreak: async (productId, pkgId, data) => await axiosInstance.post(`/admin/products/${productId}/packaging/${pkgId}/prices`, data),
  updatePriceBreak: async (productId, pkgId, priceId, data) => await axiosInstance.patch(`/admin/products/${productId}/packaging/${pkgId}/prices/${priceId}`, data),
  deletePriceBreak: async (productId, pkgId, priceId) => await axiosInstance.delete(`/admin/products/${productId}/packaging/${pkgId}/prices/${priceId}`),

  addImage: async (productId, data) => await axiosInstance.post(`/admin/products/${productId}/images`, data),
  updateImage: async (productId, imageId, data) => await axiosInstance.patch(`/admin/products/${productId}/images/${imageId}`, data),
  deleteImage: async (productId, imageId) => await axiosInstance.delete(`/admin/products/${productId}/images/${imageId}`),

  addDocument: async (productId, data) => await axiosInstance.post(`/admin/products/${productId}/documents`, data),
  updateDocument: async (productId, docId, data) => await axiosInstance.patch(`/admin/products/${productId}/documents/${docId}`, data),
  deleteDocument: async (productId, docId) => await axiosInstance.delete(`/admin/products/${productId}/documents/${docId}`),
};

// ==========================================
// Admin Catalog Config & Maintenance Services
// ==========================================
export const configAdminService = {
  getPackagingTypes: async () => await axiosInstance.get('/admin/catalog-config/packaging-types'),
  getCurrencies: async () => await axiosInstance.get('/admin/catalog-config/currencies'),
};

export const maintenanceAdminService = {
  cleanupCategoryImages: async () => await axiosInstance.post('/admin/maintenance/storage/cleanup'),
  cleanupStorage: async () => await axiosInstance.post('/admin/maintenance/storage/cleanup'),
};

export const uploadAdminService = {
  presignUrl: async (data) => await axiosInstance.post('/admin/uploads/presign', data),
};

// ==========================================
// Admin Management (RBAC & Staff & User Enable/Disable) Services
// ==========================================
export const adminManagementService = {
  getAdmins: async (params) => await axiosInstance.get('/admin/admin-management/admins', { params }),
  getAdmin: async (userId) => await axiosInstance.get(`/admin/admin-management/admins/${userId}`),
  setUserEnabled: async (userId, enabled) => await axiosInstance.patch(`/admin/users/${userId}/enabled`, { enabled }),
  promoteUser: async (userId) => await axiosInstance.post(`/admin/admin-management/admins/${userId}/promote`),
  demoteUser: async (userId) => await axiosInstance.post(`/admin/admin-management/admins/${userId}/demote`),
  assignRole: async (userId, roleId) => await axiosInstance.post(`/admin/admin-management/admins/${userId}/roles/${roleId}`),
  revokeRole: async (userId, roleId) => await axiosInstance.delete(`/admin/admin-management/admins/${userId}/roles/${roleId}`),

  getRoles: async () => await axiosInstance.get('/admin/admin-management/roles'),
  createRole: async (roleData) => await axiosInstance.post('/admin/admin-management/roles', roleData),
  updateRole: async (id, roleData) => await axiosInstance.patch(`/admin/admin-management/roles/${id}`, roleData),
  deleteRole: async (id) => await axiosInstance.delete(`/admin/admin-management/roles/${id}`),

  getInvitations: async (params) => await axiosInstance.get('/admin/admin-management/invitations', { params }),
  createInvitation: async (data) => await axiosInstance.post('/admin/admin-management/invitations', data),
  cancelInvitation: async (invitationId) => await axiosInstance.delete(`/admin/admin-management/invitations/${invitationId}`),
  resendInvitation: async (invitationId) => await axiosInstance.post(`/admin/admin-management/invitations/${invitationId}/resend`),
};

// ==========================================
// Universal Search Services
// ==========================================
export const searchService = {
  search: async (params) => await axiosInstance.get('/search', { params }),
  suggest: async (params) => await axiosInstance.get('/search/suggest', { params }),
  searchCategory: async (slug, params) => await axiosInstance.get(`/search/categories/${slug}`, { params }),
  getCategoryFacets: async (slug, params) => await axiosInstance.get(`/search/categories/${slug}/facets`, { params }),
};

// ==========================================
// DPDP Act 2023 / Privacy Compliance Services
// ==========================================
export const privacyService = {
  // Public Notice & Officer Contact
  getNotice: async () => await axiosInstance.get('/privacy/notice'),
  getContact: async () => await axiosInstance.get('/privacy/contact'),

  // Consents (Signed-in)
  getConsents: async () => await axiosInstance.get('/privacy/consents'),
  changeConsent: async (purpose, action) => await axiosInstance.post('/privacy/consents', { purpose, action }),

  // Data Export & Erasure (Requires re-auth body: { currentPassword, idToken })
  exportData: async (reauthData) => await axiosInstance.post('/privacy/export', reauthData, { responseType: 'blob' }),
  requestErasure: async (reauthData) => await axiosInstance.post('/privacy/erasure', reauthData),
  getErasureStatus: async () => await axiosInstance.get('/privacy/erasure'),
  cancelErasure: async () => await axiosInstance.delete('/privacy/erasure'),

  // Nominee Management
  getNominee: async () => await axiosInstance.get('/privacy/nominee'),
  upsertNominee: async (nomineeData) => await axiosInstance.put('/privacy/nominee', nomineeData),
  deleteNominee: async () => await axiosInstance.delete('/privacy/nominee'),

  // Public Grievances
  submitGrievance: async (grievanceData) => await axiosInstance.post('/privacy/grievances', grievanceData),
  getGrievanceStatus: async (ticket, contactEmail) => await axiosInstance.post('/privacy/grievances/status', { ticket, contactEmail }),
};

// ==========================================
// Admin Privacy & Compliance Services (USERS / PRIVACY permission)
// ==========================================
export const adminPrivacyService = {
  listErasureRequests: async (params) => await axiosInstance.get('/admin/privacy/erasure-requests', { params }),
  
  listGrievances: async (params) => await axiosInstance.get('/admin/privacy/grievances', { params }),
  getGrievance: async (id) => await axiosInstance.get(`/admin/privacy/grievances/${id}`),
  updateGrievance: async (id, data) => await axiosInstance.patch(`/admin/privacy/grievances/${id}`, data),

  listBreaches: async (params) => await axiosInstance.get('/admin/privacy/breaches', { params }),
  getBreach: async (id) => await axiosInstance.get(`/admin/privacy/breaches/${id}`),
  createBreach: async (data) => await axiosInstance.post('/admin/privacy/breaches', data),
  updateBreach: async (id, data) => await axiosInstance.patch(`/admin/privacy/breaches/${id}`, data),

  getRetentionStatus: async () => await axiosInstance.get('/admin/privacy/retention'),
};
