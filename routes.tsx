import { createBrowserRouter } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import AdminLogin from "@/pages/AdminLogin";
import AdminLayout from "@/components/admin/AdminLayout";
import CustomerLayout from "@/components/customer/CustomerLayout";
import Index from "@/pages/Index";
import Products from "@/pages/Products";
import ProductDetails from "@/pages/ProductDetails";
import Cart from "@/pages/Cart";
import Contact from "@/pages/Contact";
import Offers from "@/pages/Offers";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ProductsManagement from "@/pages/admin/ProductsManagement";
import CategoriesManagement from "@/pages/admin/CategoriesManagement";
import OrdersManagement from "@/pages/admin/OrdersManagement";
import StatsManagement from "@/pages/admin/StatsManagement";
import CustomersManagement from "@/pages/admin/CustomersManagement";
import SettingsManagement from "@/pages/admin/SettingsManagement";
import AboutUsManagement from "@/pages/admin/AboutUsManagement";
import CustomerDashboard from "@/pages/customer/CustomerDashboard";
import CustomerAbout from "@/pages/customer/CustomerAbout";
import CustomerProducts from "@/pages/customer/CustomerProducts";
import CustomerShippingPage from "@/pages/customer/CustomerShippingPage";
import AboutUs from "@/pages/AboutUs";
import GiftCards from "@/pages/GiftCards";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PaymentSuccess from "@/pages/PaymentSuccess";
// Import shipping company dashboard components
import ShippingLayout from "@/components/shipping/ShippingLayout";
import ShippingDashboard from "@/pages/shipping/ShippingDashboard";
import ShippingOrdersPage from "@/pages/shipping/ShippingOrdersPage";
import ShippingHistoryPage from "@/pages/shipping/ShippingHistoryPage";
import ShippingProfilePage from "@/pages/shipping/ShippingProfilePage";
import ShippingSettingsPage from "@/pages/shipping/ShippingSettingsPage";
import ShippingCompaniesManagement from "@/pages/admin/ShippingCompaniesManagement";
import ShippingCompanyRegistration from '@/components/shipping/ShippingCompanyRegistration';
import ShippingRequestsManager from '@/components/admin/ShippingRequestsManager';
import ShippingRegistrationForm from "@/components/shipping/ShippingRegistrationForm";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    errorElement: <NotFound />
  },
  {
    path: "/products",
    element: <Products />,
    errorElement: <NotFound />
  },
  {
    path: "/product/:id",
    element: <ProductDetails />,
    errorElement: <NotFound />
  },
  {
    path: "/cart",
    element: <Cart />,
    errorElement: <NotFound />
  },
  {
    path: "/contact",
    element: <Contact />,
    errorElement: <NotFound />
  },
  {
    path: "/offers",
    element: <Offers />,
    errorElement: <NotFound />
  },
  {
    path: "/about",
    element: <AboutUs />,
    errorElement: <NotFound />
  },
  {
    path: "/gift-cards",
    element: <GiftCards />,
    errorElement: <NotFound />
  },
  {
    path: "/auth",
    element: <Auth />,
    errorElement: <NotFound />
  },
  {
    path: "/auth-callback",
    element: <AuthCallback />,
    errorElement: <NotFound />
  },
  {
    path: "/payment-success",
    element: <PaymentSuccess />,
    errorElement: <NotFound />
  },
  {
    path: "/admin-login",
    element: <AdminLogin />
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "products", element: <ProductsManagement /> },
      { path: "categories", element: <CategoriesManagement /> },
      { path: "orders", element: <OrdersManagement /> },
      { path: "stats", element: <StatsManagement /> },
      { path: "customers", element: <CustomersManagement /> },
      { path: "about", element: <AboutUsManagement /> },
      { path: "settings", element: <SettingsManagement /> },
      { path: "shipping-companies", element: <ShippingCompaniesManagement /> },
      { path: "shipping-requests", element: <ShippingRequestsManager /> },
    ]
  },
  {
    path: "/customer-dashboard",
    element: (
      <ProtectedRoute requiredRole="customer">
        <CustomerLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <CustomerDashboard />,
      },
      {
        path: "products",
        element: <CustomerProducts />,
      },
      {
        path: "about",
        element: <CustomerAbout />,
      },
      {
        path: "shipping",
        element: <CustomerShippingPage />,
      },
    ],
  },
  // Add shipping company dashboard routes
  {
    path: "/shipping-dashboard",
    element: <ProtectedRoute><ShippingLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <ShippingDashboard /> },
      { path: "orders", element: <ShippingOrdersPage /> },
      { path: "history", element: <ShippingHistoryPage /> },
      { path: "profile", element: <ShippingProfilePage /> },
      { path: "settings", element: <ShippingSettingsPage /> },
    ]
  },
  {
    path: "/shipping-register",
    element: <ShippingRegistrationForm />,
  },
]);
