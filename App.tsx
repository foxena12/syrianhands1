import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/context/LanguageContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Layout Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminLayout from "@/components/admin/AdminLayout";
import CustomerLayout from "@/components/customer/CustomerLayout";
import ShippingLayout from "@/components/shipping/ShippingLayout";
import AboutUsSection from "@/components/AboutUsSection";
import ShippingRegistrationForm from "@/components/shipping/ShippingRegistrationForm";

// Pages
import Index from "@/pages/Index";
import Products from "@/pages/Products";
import ProductDetails from "@/pages/ProductDetails";
import Cart from "@/pages/Cart";
import Contact from "@/pages/Contact";
import Offers from "@/pages/Offers";
import NotFound from "@/pages/NotFound";
import AboutUs from "@/pages/AboutUs";
import GiftCards from "@/pages/GiftCards";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";

// Admin Pages
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ProductsManagement from "@/pages/admin/ProductsManagement";
import CategoriesManagement from "@/pages/admin/CategoriesManagement";
import OrdersManagement from "@/pages/admin/OrdersManagement";
import StatsManagement from "@/pages/admin/StatsManagement";
import CustomersManagement from "@/pages/admin/CustomersManagement";
import SettingsManagement from "@/pages/admin/SettingsManagement";
import AboutUsManagement from "@/pages/admin/AboutUsManagement";
import GiftCardManagement from "@/pages/admin/GiftCardManagement";
import ShippingCompaniesManagement from "@/pages/admin/ShippingCompaniesManagement";
import ShippingRequestsManager from "@/components/admin/ShippingRequestsManager";

// Customer Pages
import CustomerDashboard from "@/pages/customer/CustomerDashboard";
import CustomerProducts from "@/pages/customer/CustomerProducts";
import CustomerAbout from "@/pages/customer/CustomerAbout";
import CustomerShippingPage from "@/pages/customer/CustomerShippingPage";

// Shipping Company Pages
import ShippingDashboard from "@/pages/shipping/ShippingDashboard";
import ShippingOrdersPage from "@/pages/shipping/ShippingOrdersPage";
import ShippingHistoryPage from "@/pages/shipping/ShippingHistoryPage";
import ShippingProfilePage from "@/pages/shipping/ShippingProfilePage";
import ShippingSettingsPage from "@/pages/shipping/ShippingSettingsPage";

// Context Providers
import { CartProvider } from "@/context/CartContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Create a client for React Query
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <CartProvider>
              <Navbar />
              <main>
                <Routes>
                  {/* Main routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/offers" element={<Offers />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/gift-cards" element={<GiftCards />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth-callback" element={<AuthCallback />} />
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route path="/shipping-register" element={<ShippingRegistrationForm />} />

                  {/* Admin routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<ProductsManagement />} />
                    <Route path="categories" element={<CategoriesManagement />} />
                    <Route path="orders" element={<OrdersManagement />} />
                    <Route path="stats" element={<StatsManagement />} />
                    <Route path="customers" element={<CustomersManagement />} />
                    <Route path="about" element={<AboutUsManagement />} />
                    <Route path="settings" element={<SettingsManagement />} />
                    <Route path="gift-cards" element={<GiftCardManagement />} />
                    <Route path="shipping-companies" element={<ShippingCompaniesManagement />} />
                    <Route path="shipping-requests" element={<ShippingRequestsManager />} />
                  </Route>
                  
                  {/* Customer routes */}
                  <Route path="/customer-dashboard" element={
                    <ProtectedRoute>
                      <CustomerLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<CustomerDashboard />} />
                    <Route path="products" element={<CustomerProducts />} />
                    <Route path="about" element={<CustomerAbout />} />
                    <Route path="shipping" element={<CustomerShippingPage />} />
                  </Route>
                  
                  {/* Shipping company routes */}
                  <Route path="/shipping-dashboard" element={
                    <ProtectedRoute>
                      <ShippingLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<ShippingDashboard />} />
                    <Route path="orders" element={<ShippingOrdersPage />} />
                    <Route path="history" element={<ShippingHistoryPage />} />
                    <Route path="profile" element={<ShippingProfilePage />} />
                    <Route path="settings" element={<ShippingSettingsPage />} />
                  </Route>

                  {/* 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <Toaster />
            </CartProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
