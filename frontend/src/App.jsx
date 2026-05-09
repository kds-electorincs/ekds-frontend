import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/admin/DashboardLayout';
import Home from './pages/Home';
import DashboardHome from './pages/admin/DashboardHome';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ProductListing from './pages/ProductListing';
import ProductDetails from './pages/ProductDetails';
import DashboardProducts from './pages/admin/DashboardProducts';
import DashboardOrders from './pages/admin/DashboardOrders';
import DashboardUsers from './pages/admin/DashboardUsers';
import DashboardAnalytics from './pages/admin/DashboardAnalytics';
import DashboardCategories from './pages/admin/DashboardCategories';
import DashboardMedia from './pages/admin/DashboardMedia';

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Dashboard Routes */}
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="categories" element={<DashboardCategories />} />
          <Route path="products" element={<DashboardProducts />} />
          <Route path="orders" element={<DashboardOrders />} />
          <Route path="users" element={<DashboardUsers />} />
          <Route path="media" element={<DashboardMedia />} />
          <Route path="analytics" element={<DashboardAnalytics />} />
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
