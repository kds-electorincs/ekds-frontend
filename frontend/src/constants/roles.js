/**
 * Spring Security Authorities & User Role Constants
 * Matches backend roles:
 * - ROLE_SUPER_ADMIN -> SUPER_ADMIN
 * - ROLE_ADMIN       -> ADMIN
 * - ROLE_USER        -> CUSTOMER / USER
 */
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  USER: 'USER',
  CUSTOMER: 'CUSTOMER',

  // Legacy role name mappings for backwards compatibility
  PRODUCT_MANAGER: 'PRODUCT_MANAGER',
  SUPPORT_STAFF: 'SUPPORT_STAFF',
  ORDER_MANAGER: 'ORDER_MANAGER',
  ANALYTICS_MANAGER: 'ANALYTICS_MANAGER',
};
