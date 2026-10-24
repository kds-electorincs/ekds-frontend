import { ROLES } from './roles';

/**
 * Backend AdminPage Enum values as defined in com.knds.commons.security.AdminPage:
 * PRODUCTS, CATEGORIES, ORDERS, USERS, SUPPORT, FINANCE, BANNERS, REPORTS
 */
export const ADMIN_PAGES = {
  PRODUCTS: 'PRODUCTS',
  CATEGORIES: 'CATEGORIES',
  ORDERS: 'ORDERS',
  USERS: 'USERS',
  SUPPORT: 'SUPPORT',
  FINANCE: 'FINANCE',
  BANNERS: 'BANNERS',
  REPORTS: 'REPORTS',
};

/**
 * Metadata and descriptions for each backend AdminPage
 */
export const ADMIN_PAGE_METADATA = {
  [ADMIN_PAGES.PRODUCTS]: {
    label: 'Products & Catalog',
    description: 'Manage products, packaging options, price breaks, catalog config, images, and documents',
    badgeColor: 'primary',
    endpoints: ['/api/admin/products/**', '/api/admin/catalog-config/**', '/api/admin/maintenance/**'],
  },
  [ADMIN_PAGES.CATEGORIES]: {
    label: 'Categories & Taxonomy',
    description: 'Manage categories, segments, attributes, and category hierarchies',
    badgeColor: 'secondary',
    endpoints: ['/api/admin/categories/**'],
  },
  [ADMIN_PAGES.ORDERS]: {
    label: 'Orders & Shipments',
    description: 'View orders, update order status, ship orders with courier tracking and notes',
    badgeColor: 'success',
    endpoints: ['/api/admin/orders/**'],
  },
  [ADMIN_PAGES.USERS]: {
    label: 'Users & Privacy (DPDP)',
    description: 'Enable/disable user accounts, manage privacy grievances, breaches, and data retention',
    badgeColor: 'info',
    endpoints: ['/api/admin/users/{id}/enabled', '/api/admin/privacy/**'],
  },
  [ADMIN_PAGES.FINANCE]: {
    label: 'Finance & Delivery Rates',
    description: 'Manage per-zone delivery rates, inspect payment discrepancies, and FX rates',
    badgeColor: 'warning',
    endpoints: ['/api/admin/delivery-rates/**', '/api/admin/payments/**', '/api/admin/fx-rates/**'],
  },
  [ADMIN_PAGES.SUPPORT]: {
    label: 'Customer Support',
    description: 'Customer inquiry desk and customer support ticketing operations',
    badgeColor: 'default',
    endpoints: ['/api/admin/support/**'],
  },
  [ADMIN_PAGES.BANNERS]: {
    label: 'Marketing Banners',
    description: 'Storefront promotional banners, hero carousel slides, and marketing notices',
    badgeColor: 'default',
    endpoints: ['/api/admin/banners/**'],
  },
  [ADMIN_PAGES.REPORTS]: {
    label: 'Analytics & Reports',
    description: 'Store revenue analytics, order volume trends, inventory audits, and export reports',
    badgeColor: 'default',
    endpoints: ['/api/admin/reports/**'],
  },
};

/**
 * Frontend Permission Keys mapped directly to Backend RBAC gates:
 * - 'SUPER_ADMIN' gate for /api/admin/admin-management/**
 * - 'ADMIN_PAGE.*' gates for @adminPageGuard.canAccess('...')
 */
export const PERMISSIONS = {
  // General Dashboard Access (Available to any valid admin)
  VIEW_DASHBOARD: 'VIEW_DASHBOARD',

  // RBAC Admin Management (Restricted to ROLE_SUPER_ADMIN)
  MANAGE_STAFF: 'SUPER_ADMIN',

  // Page-Level RBAC Gated Features
  MANAGE_CATEGORIES: ADMIN_PAGES.CATEGORIES,
  MANAGE_PRODUCTS: ADMIN_PAGES.PRODUCTS,
  MANAGE_MEDIA: ADMIN_PAGES.PRODUCTS,
  MANAGE_CONFIG: ADMIN_PAGES.PRODUCTS,
  MANAGE_MAINTENANCE: ADMIN_PAGES.PRODUCTS,
  
  MANAGE_ORDERS: ADMIN_PAGES.ORDERS,
  UPDATE_ORDER_STATUS: ADMIN_PAGES.ORDERS,

  VIEW_USERS: ADMIN_PAGES.USERS,
  MANAGE_USERS: ADMIN_PAGES.USERS,
  VIEW_LOGS: ADMIN_PAGES.USERS,

  MANAGE_FINANCE: ADMIN_PAGES.FINANCE,
  MANAGE_DELIVERY_RATES: ADMIN_PAGES.FINANCE,
  MANAGE_DISCREPANCIES: ADMIN_PAGES.FINANCE,

  VIEW_ANALYTICS: ADMIN_PAGES.REPORTS,
  MANAGE_SUPPORT: ADMIN_PAGES.SUPPORT,
  MANAGE_BANNERS: ADMIN_PAGES.BANNERS,
};

/**
 * Helper to resolve whether a permission maps to a specific AdminPage
 */
export const getPageForPermission = (permission) => {
  if (!permission) return null;
  if (Object.values(ADMIN_PAGES).includes(permission)) return permission;
  return PERMISSIONS[permission] || null;
};
