import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import StoreLayout from "@/components/store/StoreLayout";
import Home from "@/pages/store/Home";
import Shop from "@/pages/store/Shop";
import Categories from "@/pages/store/Categories";
import ProductDetail from "@/pages/store/ProductDetail";
import Cart from "@/pages/store/Cart";
import Checkout from "@/pages/store/Checkout";
import Account from "@/pages/store/Account";

import POS from "@/pages/pos/POS";

import AdminLayout from "@/components/admin/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import Products from "@/pages/admin/Products";
import Orders from "@/pages/admin/Orders";
import Inventory from "@/pages/admin/Inventory";
import Sales from "@/pages/admin/Sales";
import Users from "@/pages/admin/Users";
import Reports from "@/pages/admin/Reports";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Customer storefront */}
          <Route element={<StoreLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/account" element={<Account />} />
          </Route>

          {/* POS system */}
          <Route path="/pos" element={<POS />} />

          {/* Admin panel */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="sales" element={<Sales />} />
            <Route path="users" element={<Users />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
