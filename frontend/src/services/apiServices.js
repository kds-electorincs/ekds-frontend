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

  // TODO(backend-missing): No backend endpoint for PUT /users/profile.
  // Feature: Profile edit form (pages/user/Profile.jsx) — not currently
  // wired to any API call (form is local-state only), so no call site needed
  // updating.
  // Suggested endpoint: PUT /api/users/profile
  updateProfile: async (userData) => await axiosInstance.put('/users/profile', userData),

  // TODO(backend-missing): No backend endpoint for GET /users/me/favorites.
  // Feature: Favorites list. See commented-out call site in pages/user/Favorites.jsx.
  // Suggested endpoint: GET /api/users/me/favorites
  getFavorites: async () => await axiosInstance.get('/users/me/favorites'),

  // TODO(backend-missing): No backend endpoint for GET /users/me/quotations.
  // Feature: Corporate Quotations. See commented-out call site in pages/user/Quotations.jsx.
  // Suggested endpoint: GET /api/users/me/quotations
  getQuotations: async () => await axiosInstance.get('/users/me/quotations'),

  // TODO(backend-missing): No backend endpoint for GET /users/me/pending-payments.
  // Feature: Pending Payments list. See commented-out call site in pages/user/PendingPayments.jsx.
  // Suggested endpoint: GET /api/users/me/pending-payments
  getPendingPayments: async () => await axiosInstance.get('/users/me/pending-payments'),

  // TODO(backend-missing): No backend endpoint for GET /users/me/orders.
  // Feature: My Orders list. See commented-out call site in pages/user/MyOrders.jsx
  // (NEEDS MANUAL REVIEW there re: OrderController's GET /api/orders).
  // Suggested endpoint: GET /api/users/me/orders
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
// TODO(backend-missing): No backend endpoint for GET /public/home.
// Feature: Home.jsx banners/featured-products aggregate. See the commented-out
// call site in pages/Home.jsx, which already falls back to
// categoryPublicService/productPublicService directly.
// Suggested endpoint: GET /api/public/home
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
  // TODO(backend-missing): No backend endpoint for GET /brands.
  // Feature: Parametric search "Manufacturer" filter (ParametricSearch.jsx).
  // Suggested endpoint: GET /api/brands
  getBrands: async () => await axiosInstance.get('/brands'),

  // TODO(backend-missing): No backend endpoint for POST/PUT/DELETE /products.
  // Feature: legacy admin product management — unused; superseded by
  // productAdminService, whose paths (/admin/products/**) match
  // ProductController exactly. Kept here only for reference.
  // Suggested endpoint: use productAdminService instead.
  createProduct: async (productData) => await axiosInstance.post('/products', productData),
  updateProduct: async (id, productData) => await axiosInstance.put(`/products/${id}`, productData),
  deleteProduct: async (id) => await axiosInstance.delete(`/products/${id}`),
};




// ==========================================
// Order Services (KDS Checkout Frontend Integration Guide)
// ==========================================
export const orderService = {
  // POST /api/orders?currency= — places an order from the current server
  // cart. Returns { orderId, orderNumber, paymentLinkUrl, linkExpiresAt, ... }
  // on 201. May 400 (backorder ack / multi-GSTIN) or 409 (pending order
  // exists) — callers must inspect err.response.data (ProblemDetail) shape.
  createOrder: async (orderData, currency = 'INR') =>
    await axiosInstance.post('/orders', orderData, { params: { currency } }),

  // GET /api/orders?page=&size= — paged list of the logged-in user's own
  // orders, newest first.
  getUserOrders: async (params) => await axiosInstance.get('/orders', { params }),

  // GET /api/orders/{orderNumber} — full detail. No currency param (frozen
  // display currency, guide §4).
  getOrderById: async (orderNumber) => await axiosInstance.get(`/orders/${orderNumber}`),

  // TODO(backend-missing): No backend endpoint for
  // GET /orders/{orderNumber}/tracking. OrderController only exposes
  // place/list/get — no tracking method exists at all.
  // Feature: order status-history timeline. See commented-out call site in
  // pages/OrderStatus.jsx.
  // Suggested endpoint: GET /api/orders/{orderNumber}/tracking
  // getOrderTracking: async (orderNumber) => await axiosInstance.get(`/orders/${orderNumber}/tracking`),

  // TODO(backend-missing): No backend endpoint for
  // POST /orders/{orderNumber}/cancel. OrderController has no cancel method.
  // Feature: "Cancel Order" button. See commented-out call site in
  // pages/OrderStatus.jsx.
  // Suggested endpoint: POST /api/orders/{orderNumber}/cancel
  // cancelOrder: async (orderNumber) => await axiosInstance.post(`/orders/${orderNumber}/cancel`),
};

// ==========================================
// Admin Order Management Services (requires ORDERS page grant)
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
// Admin Payment Reconciliation Services (requires FINANCE page grant)
// ==========================================
export const adminPaymentService = {
  getMismatches: async (params) => await axiosInstance.get('/admin/payments/mismatches', { params }),
  resolveMismatch: async (id, resolutionNote) =>
    await axiosInstance.post(`/admin/payments/mismatches/${id}/resolve`, { resolutionNote }),
};


// ==========================================
// Dashboard Services (DashboardHome.jsx)
// ==========================================
// TODO(backend-missing): No backend controller exists for any /dashboard/**
// route at all — there is no DashboardController in ekds-backend.
// Feature: Admin Dashboard overview (pages/admin/DashboardHome.jsx). Not
// currently called from that page (it renders fully static/mock data today),
// so nothing needed to be commented out at a call site — flagging here only.
// Suggested endpoints: GET /api/admin/dashboard/stats,
// GET /api/admin/dashboard/recent-orders, GET /api/admin/dashboard/low-stock,
// GET /api/admin/dashboard/sales-chart
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
  // Returns the list of supported display currencies (e.g. ["INR", "USD"]).
  // If length === 1, the currency selector should be hidden entirely (per KDS spec §10).
  getSupportedCurrencies: async () => await axiosInstance.get('/store/products/currencies'),
};

// ==========================================
// Cart Services  (KDS Cart API — all require Bearer JWT)
// ==========================================
// IMPORTANT — POST vs PATCH semantics (from KDS spec §3):
//   POST  /cart/items          → INCREMENTS quantity (or creates line). Use for "Add to Cart".
//   PATCH /cart/items/{id}     → SETS absolute quantity. Use for the qty stepper on Cart page.
//   Mixing them causes silent cart doubling.
//
// Every mutation (POST/PATCH/DELETE-item) returns the full CartResponse.
// Never follow a mutation with a GET (spec §4).
//
// Price fields:
//   *InrScaled  → INR (always divide by 10^priceScale, currently 4)
//   *Scaled     → display currency (whatever ?currency= was passed)
//   Unit prices must be shown to 4 decimal places (spec §2).
export const cartService = {
  /**
   * Load the full cart.
   * @param {string} currency - Display currency code (default 'INR'). Case-insensitive.
   * Returns CartResponse.
   */
  getCart: async (currency = 'INR') =>
    await axiosInstance.get('/cart', { params: { currency } }),

  /**
   * Add or INCREMENT a line.
   * POST semantics — if the line already exists, quantity is ADDED to existing qty.
   * Use this for the "Add to Cart" button on the product page.
   * @param {number} packagingOptionId
   * @param {number} quantity
   * Returns full CartResponse.
   */
  addItem: async (packagingOptionId, quantity) =>
    await axiosInstance.post('/cart/items', { packagingOptionId, quantity }),

  /**
   * SET absolute quantity on an existing line.
   * PATCH semantics — not a delta, replaces the current qty.
   * Use this for the qty stepper on the Cart page.
   * 404 if the line is not in the cart.
   * @param {number} packagingOptionId - URL key for the line
   * @param {number} quantity
   * Returns full CartResponse.
   */
  updateItem: async (packagingOptionId, quantity) =>
    await axiosInstance.patch(`/cart/items/${packagingOptionId}`, { quantity }),

  /**
   * Remove a single line. Idempotent — deleting a missing line returns 200, not 404.
   * @param {number} packagingOptionId
   * Returns full CartResponse.
   */
  removeItem: async (packagingOptionId) =>
    await axiosInstance.delete(`/cart/items/${packagingOptionId}`),

  /**
   * Clear the entire cart. Returns 204 with no body.
   */
  clearCart: async () =>
    await axiosInstance.delete('/cart'),
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
  cleanupCategoryImages: async () => await axiosInstance.post('/admin/maintenance/storage/cleanup'),
  cleanupStorage: async () => await axiosInstance.post('/admin/maintenance/storage/cleanup'),
};

// ==========================================
// Admin Upload Services
// ==========================================
export const uploadAdminService = {
  presignUrl: async (data) => await axiosInstance.post('/admin/uploads/presign', data),
};

// ==========================================
// Admin Management (RBAC & Staff) Services
// ==========================================
export const adminManagementService = {
  // AdminUserController: GET /api/admin/admin-management/admins
  getAdmins: async (params) => await axiosInstance.get('/admin/admin-management/admins', { params }),
  getAdmin: async (userId) => await axiosInstance.get(`/admin/admin-management/admins/${userId}`),
  promoteUser: async (userId) => await axiosInstance.post(`/admin/admin-management/admins/${userId}/promote`),
  demoteUser: async (userId) => await axiosInstance.post(`/admin/admin-management/admins/${userId}/demote`),
  assignRole: async (userId, roleId) => await axiosInstance.post(`/admin/admin-management/admins/${userId}/roles/${roleId}`),
  revokeRole: async (userId, roleId) => await axiosInstance.delete(`/admin/admin-management/admins/${userId}/roles/${roleId}`),

  // AdminRoleController: /api/admin/admin-management/roles
  getRoles: async () => await axiosInstance.get('/admin/admin-management/roles'),
  createRole: async (roleData) => await axiosInstance.post('/admin/admin-management/roles', roleData),
  updateRole: async (id, roleData) => await axiosInstance.patch(`/admin/admin-management/roles/${id}`, roleData),
  deleteRole: async (id) => await axiosInstance.delete(`/admin/admin-management/roles/${id}`),

  // AdminInvitationController: /api/admin/admin-management/invitations
  getInvitations: async (params) => await axiosInstance.get('/admin/admin-management/invitations', { params }),
  createInvitation: async (data) => await axiosInstance.post('/admin/admin-management/invitations', data),
  cancelInvitation: async (invitationId) => await axiosInstance.delete(`/admin/admin-management/invitations/${invitationId}`),
  resendInvitation: async (invitationId) => await axiosInstance.post(`/admin/admin-management/invitations/${invitationId}/resend`),
};

// ==========================================
// Universal Search (Meilisearch) Services
// ==========================================
export const searchService = {
  search: async (params) => await axiosInstance.get('/search', { params }),
  suggest: async (params) => await axiosInstance.get('/search/suggest', { params }),
  searchCategory: async (slug, params) => await axiosInstance.get(`/search/categories/${slug}`, { params }),
  getCategoryFacets: async (slug, params) => await axiosInstance.get(`/search/categories/${slug}/facets`, { params }),
};

