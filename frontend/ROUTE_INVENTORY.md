# Route Inventory & Migration Strategy

## 1. Public Storefront Routes (SSR Candidates)
| URL Path | Current Component | Strategy | Server-side Data Fetching | Metadata & SEO |
|---|---|---|---|---|
| `/` | `src/pages/Home.jsx` | SSR | `categoryPublicService.listCategories()`, `productPublicService.listProducts({ size: 16 })` | Organization, WebSite JSON-LD, Title, OpenGraph |
| `/products` | `src/pages/ProductListing.jsx` | SSR + Client Filter | `categoryPublicService.listCategories()`, `productPublicService.listProducts(searchParams)` | Product Collection Title, Meta, Breadcrumbs |
| `/product/:id` | `src/pages/ProductDetails.jsx` | SSR + Dynamic Params | `productPublicService.getProduct(id)`, related products, categories | Product JSON-LD, OpenGraph Image & Pricing |
| `/about` | `src/pages/About.jsx` | SSR | Static content | About Metadata, Breadcrumbs |
| `/contact` | `src/pages/Contact.jsx` | SSR | Static content | Contact Metadata |
| `/privacy-policy` | `src/pages/PrivacyPolicyPage.jsx` | SSR | Static content | DPDP / Privacy Policy Meta |
| `/privacy-notice` | `src/pages/PrivacyPolicyPage.jsx` | SSR | Static content | Canonical to /privacy-policy |
| `/privacy-grievance` | `src/pages/PublicGrievanceForm.jsx` | SSR Shell + Client Form | Static shell | Grievance Form Meta |
| `/login` | `src/pages/Login.jsx` | CSR (Client Component) | - | Noindex |
| `/register` | `src/pages/Register.jsx` | CSR (Client Component) | - | Noindex |
| `/forgot-password` | `src/pages/ForgotPassword.jsx` | CSR (Client Component) | - | Noindex |
| `/accept-invitation/:token` | `src/pages/AcceptInvitation.jsx` | CSR (Client Component) | Invitation Preview | Noindex |
| `/cart` | `src/pages/Cart.jsx` | CSR (Client Component) | Cart Context | Noindex |
| `/checkout` | `src/pages/Checkout.jsx` | CSR (Client Component) | Cart/Checkout state | Noindex |
| `/orders` | `src/pages/OrdersLanding.jsx` | CSR (Client Component) | - | Noindex |
| `/orders/:orderNumber` | `src/pages/OrderStatus.jsx` | CSR (Client Component) | Order lookup | Noindex |

## 2. Customer Dashboard Routes (CSR - Protected)
| URL Path | Current Component | Strategy |
|---|---|---|
| `/user/dashboard` | `src/pages/user/UserDashboard.jsx` | CSR (`"use client"`) |
| `/user/orders` | `src/pages/user/MyOrders.jsx` | CSR (`"use client"`) |
| `/user/quotations` | `src/pages/user/Quotations.jsx` | CSR (`"use client"`) |
| `/user/favorites` | `src/pages/user/Favorites.jsx` | CSR (`"use client"`) |
| `/user/profile` | `src/pages/user/Profile.jsx` | CSR (`"use client"`) |
| `/user/addresses` | `src/pages/user/SavedAddresses.jsx` | CSR (`"use client"`) |
| `/user/preferences` | `src/pages/user/EmailPreferences.jsx` | CSR (`"use client"`) |

## 3. Admin Panel Routes (CSR - Protected RBAC)
| URL Path | Current Component | Strategy |
|---|---|---|
| `/admin/dashboard` | `src/pages/admin/DashboardHome.jsx` | CSR (`"use client"`) |
| `/admin/categories` | `src/pages/admin/DashboardCategories.jsx` | CSR (`"use client"`) |
| `/admin/categories/:id` | `src/pages/admin/DashboardCategoryDetails.jsx` | CSR (`"use client"`) |
| `/admin/products` | `src/pages/admin/DashboardProducts.jsx` | CSR (`"use client"`) |
| `/admin/products/:id` | `src/pages/admin/DashboardProductDetails.jsx` | CSR (`"use client"`) |
| `/admin/orders` | `src/pages/admin/DashboardOrders.jsx` | CSR (`"use client"`) |
| `/admin/delivery-rates` | `src/pages/admin/DashboardDeliveryRates.jsx` | CSR (`"use client"`) |
| `/admin/privacy` | `src/pages/admin/DashboardPrivacy.jsx` | CSR (`"use client"`) |
| `/admin/staff` | `src/pages/admin/StaffManagement.jsx` | CSR (`"use client"`) |
| `/admin/discrepancies` | `src/pages/admin/DashboardDiscrepancies.jsx` | CSR (`"use client"`) |
| `/admin/catalog-config` | `src/pages/admin/DashboardCatalogConfig.jsx` | CSR (`"use client"`) |
| `/admin/maintenance` | `src/pages/admin/DashboardMaintenance.jsx` | CSR (`"use client"`) |
| `/admin/logs` | `src/pages/admin/ActivityLogs.jsx` | CSR (`"use client"`) |
| `/admin/media` | `src/pages/admin/DashboardMedia.jsx` | CSR (`"use client"`) |
| `/admin/analytics` | `src/pages/admin/DashboardAnalytics.jsx` | CSR (`"use client"`) |
| `/admin/users` | `src/pages/admin/DashboardUsers.jsx` | CSR (`"use client"`) |
