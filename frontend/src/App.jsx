import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/admin/DashboardLayout';
import UserDashboardLayout from './layouts/user/UserDashboardLayout';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ProductListing from './pages/ProductListing';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentGateway from './pages/PaymentGateway';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import MyOrders from './pages/user/MyOrders';
import Quotations from './pages/user/Quotations';
import Favorites from './pages/user/Favorites';
import Profile from './pages/user/Profile';
import SavedAddresses from './pages/user/SavedAddresses';
import EmailPreferences from './pages/user/EmailPreferences';

// Admin Pages
import DashboardHome from './pages/admin/DashboardHome';
import DashboardProducts from './pages/admin/DashboardProducts';
import DashboardProductDetails from './pages/admin/DashboardProductDetails';
import DashboardOrders from './pages/admin/DashboardOrders';
import DashboardUsers from './pages/admin/DashboardUsers';
import DashboardAnalytics from './pages/admin/DashboardAnalytics';
import DashboardCategories from './pages/admin/DashboardCategories';
import DashboardCategoryDetails from './pages/admin/DashboardCategoryDetails';
import DashboardMedia from './pages/admin/DashboardMedia';
import DashboardCatalogConfig from './pages/admin/DashboardCatalogConfig';
import DashboardMaintenance from './pages/admin/DashboardMaintenance';
import StaffManagement from './pages/admin/StaffManagement';
import ActivityLogs from './pages/admin/ActivityLogs';

// Security and Auth
import { useAuth } from './context/AuthContext';
import { PERMISSIONS } from './constants/permissions';
import { ROLES } from './constants/roles';
import { ProtectedRoute } from './components/common/SecurityGuards';

const ProtectedAdminRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If user does not have an admin-level role, redirect them to public home
  const isAdmin = Object.values(ROLES).includes(user.role) || user.role === 'ADMIN' || user.role === 'MANAGER' || user.role === 'STAFF';
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const PermissionRoute = ({ permission, children }) => {
  const { user, hasPermission } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!hasPermission(permission)) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <>
      <Routes>
        {/* PUBLIC ROUTES (Storefront) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          
          {/* Customer Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* E-Commerce Cart, Checkout & Payment Gateway */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<PaymentGateway />} />
        </Route>

        {/* CUSTOMER DASHBOARD ROUTES */}
        <Route path="/user" element={
          <ProtectedRoute>
            <UserDashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/user/dashboard" replace />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="quotations" element={<Quotations />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="profile" element={<Profile />} />
          <Route path="addresses" element={<SavedAddresses />} />
          <Route path="preferences" element={<EmailPreferences />} />
        </Route>

        {/* ADMIN ROUTES (Admin Panel) */}
        <Route path="/admin" element={
          <ProtectedAdminRoute>
            <DashboardLayout />
          </ProtectedAdminRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          
          <Route path="dashboard" element={
            <PermissionRoute permission={PERMISSIONS.VIEW_DASHBOARD}>
              <DashboardHome />
            </PermissionRoute>
          } />
          
          {/* Catalog Management (Phase 2) */}
          <Route path="categories" element={
            <PermissionRoute permission={PERMISSIONS.MANAGE_CATEGORIES}>
              <DashboardCategories />
            </PermissionRoute>
          } />
          <Route path="categories/:id" element={
            <PermissionRoute permission={PERMISSIONS.MANAGE_CATEGORIES}>
              <DashboardCategoryDetails />
            </PermissionRoute>
          } />
          
          <Route path="products" element={
            <PermissionRoute permission={PERMISSIONS.MANAGE_PRODUCTS}>
              <DashboardProducts />
            </PermissionRoute>
          } />
          <Route path="products/:id" element={
            <PermissionRoute permission={PERMISSIONS.MANAGE_PRODUCTS}>
              <DashboardProductDetails />
            </PermissionRoute>
          } />
          
          <Route path="catalog-config" element={
            <PermissionRoute permission={PERMISSIONS.MANAGE_CONFIG}>
              <DashboardCatalogConfig />
            </PermissionRoute>
          } />
          
          <Route path="maintenance" element={
            <PermissionRoute permission={PERMISSIONS.MANAGE_MAINTENANCE}>
              <DashboardMaintenance />
            </PermissionRoute>
          } />
          
          {/* Orders & Customers */}
          <Route path="orders" element={
            <PermissionRoute permission={PERMISSIONS.MANAGE_ORDERS}>
              <DashboardOrders />
            </PermissionRoute>
          } />
          
          <Route path="users" element={
            <PermissionRoute permission={PERMISSIONS.VIEW_USERS}>
              <DashboardUsers />
            </PermissionRoute>
          } />

          {/* Admin Configuration */}
          <Route path="staff" element={
            <PermissionRoute permission={PERMISSIONS.MANAGE_STAFF}>
              <StaffManagement />
            </PermissionRoute>
          } />

          <Route path="logs" element={
            <PermissionRoute permission={PERMISSIONS.VIEW_LOGS}>
              <ActivityLogs />
            </PermissionRoute>
          } />
          
          <Route path="media" element={
            <PermissionRoute permission={PERMISSIONS.MANAGE_MEDIA}>
              <DashboardMedia />
            </PermissionRoute>
          } />
          
          <Route path="analytics" element={
            <PermissionRoute permission={PERMISSIONS.VIEW_ANALYTICS}>
              <DashboardAnalytics />
            </PermissionRoute>
          } />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer 
        position="bottom-right" 
        autoClose={3000} 
        transition={Slide}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
