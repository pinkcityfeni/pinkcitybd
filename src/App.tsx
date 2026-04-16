import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/data/language";

// Layouts
import StoreLayout from "@/components/store/StoreLayout";
import AdminLayout from "@/components/admin/AdminLayout";
import POSLayout from "@/components/pos/POSLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Public pages - Store
import Home from "@/pages/store/Home";
import Shop from "@/pages/store/Shop";
import Category from "@/pages/store/Category";
import ProductDetail from "@/pages/store/ProductDetail";
import Cart from "@/pages/store/Cart";
import Checkout from "@/pages/store/Checkout";
import Account from "@/pages/store/Account";
import Wishlist from "@/pages/store/Wishlist";

// Auth pages
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";

// POS pages (protected: cashier or admin)
import POSSales from "@/pages/pos/POSSales";
import POSSalesHistory from "@/pages/pos/POSSalesHistory";
import POSBarcode from "@/pages/pos/POSBarcode";

// Admin pages (protected: admin only)
import Dashboard from "@/pages/admin/Dashboard";
import Products from "@/pages/admin/Products";
import Orders from "@/pages/admin/Orders";
import Inventory from "@/pages/admin/Inventory";
import Sales from "@/pages/admin/Sales";
import Users from "@/pages/admin/Users";
import AdminCategories from "@/pages/admin/Categories";
import AdminBanners from "@/pages/admin/Banners";
import AdminReviews from "@/pages/admin/Reviews";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* ─── Public: Customer Storefront ─── */}
            <Route element={<StoreLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/category" element={<Category />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/account" element={<Account />} />
              <Route path="/wishlist" element={<Wishlist />} />
            </Route>

            {/* ─── Public: Auth ─── */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* ─── Protected: POS (cashier or admin) ─── */}
            <Route
              path="/pos"
              element={
                <ProtectedRoute requiredRole="cashier">
                  <POSLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<POSSales />} />
              <Route path="sales" element={<POSSalesHistory />} />
              <Route path="barcode" element={<POSBarcode />} />
            </Route>

            {/* ─── Protected: Admin (admin only) ─── */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="orders" element={<Orders />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="sales" element={<Sales />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="users" element={<Users />} />
            </Route>

            {/* ─── Catch-all ─── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
