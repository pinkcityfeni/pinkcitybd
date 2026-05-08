import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/data/language";

// Layouts
import StoreLayout from "@/components/store/StoreLayout";
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout"));
const POSLayout = lazy(() => import("@/components/pos/POSLayout"));
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

// POS pages (lazy)
const POSSales = lazy(() => import("@/pages/pos/POSSales"));
const POSSalesHistory = lazy(() => import("@/pages/pos/POSSalesHistory"));
const POSBarcode = lazy(() => import("@/pages/pos/POSBarcode"));

// Admin pages (lazy)
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const Products = lazy(() => import("@/pages/admin/Products"));
const Orders = lazy(() => import("@/pages/admin/Orders"));
const Inventory = lazy(() => import("@/pages/admin/Inventory"));
const Sales = lazy(() => import("@/pages/admin/Sales"));
const Users = lazy(() => import("@/pages/admin/Users"));
const AdminCategories = lazy(() => import("@/pages/admin/Categories"));
const AdminBanners = lazy(() => import("@/pages/admin/Banners"));
const AdminReviews = lazy(() => import("@/pages/admin/Reviews"));
const AdminCustomers = lazy(() => import("@/pages/admin/Customers"));
const FacebookImport = lazy(() => import("@/pages/admin/FacebookImport"));
const Brands = lazy(() => import("@/pages/admin/Brands"));
const Vouchers = lazy(() => import("@/pages/admin/Vouchers"));
const DeliveryAreas = lazy(() => import("@/pages/admin/DeliveryAreas"));
const AdminNotifications = lazy(() => import("@/pages/admin/Notifications"));
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
    Loading…
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
       <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<PageFallback />}>
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
              <Route path="fb-import" element={<FacebookImport />} />
              <Route path="brands" element={<Brands />} />
              <Route path="vouchers" element={<Vouchers />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="orders" element={<Orders />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="sales" element={<Sales />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="users" element={<Users />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="delivery-areas" element={<DeliveryAreas />} />
              <Route path="notifications" element={<AdminNotifications />} />
            </Route>

            {/* ─── Catch-all ─── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
