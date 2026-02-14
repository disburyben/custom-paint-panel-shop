import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import RollerDoorLoader from "./components/RollerDoorLoader";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Gallery from "./pages/Gallery";
import Shop from "./pages/Shop";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/AdminLogin";

// Admin pages (rendered inside AdminLayout)
import AdminDashboard from "./pages/admin/AdminDashboard";
import QuotesManager from "./pages/admin/QuotesManager";
import AdminTeam from "./pages/admin/TeamManager";
import BlogManager from "./pages/admin/cms/BlogManager";
import TestimonialsManager from "./pages/admin/cms/TestimonialsManager";
import ServicesManager from "./pages/admin/cms/ServicesManager";
import GalleryManager from "./pages/admin/cms/GalleryManager";
import BusinessInfoManager from "./pages/admin/cms/BusinessInfoManager";
import Analytics from "./pages/admin/cms/Analytics";

// Shop admin pages
import ProductsManager from "./pages/admin/shop/ProductsManager";
import OrdersManager from "./pages/admin/shop/OrdersManager";
import GiftCertificatesManager from "./pages/admin/shop/GiftCertificatesManager";

/** Wraps a page component in the admin layout shell */
function withAdminLayout(Component: React.ComponentType) {
  return function AdminPage() {
    return (
      <AdminLayout>
        <Component />
      </AdminLayout>
    );
  };
}

function Router() {
  return (
    <Switch>
      {/* Public site routes — inside the public Layout */}
      <Route path="/">
        <Layout><Home /></Layout>
      </Route>
      <Route path="/services">
        <Layout><Services /></Layout>
      </Route>
      <Route path="/gallery">
        <Layout><Gallery /></Layout>
      </Route>
      <Route path="/shop">
        <Layout><Shop /></Layout>
      </Route>
      <Route path="/about">
        <Layout><About /></Layout>
      </Route>
      <Route path="/contact">
        <Layout><Contact /></Layout>
      </Route>

      {/* Admin login — no layout wrapper */}
      <Route path="/admin/login" component={AdminLogin} />

      {/* Admin routes — inside AdminLayout (sidebar + auth guard) */}
      <Route path="/admin/quotes" component={withAdminLayout(QuotesManager)} />
      <Route path="/admin/team" component={withAdminLayout(AdminTeam)} />

      {/* Shop admin */}
      <Route path="/admin/shop/products" component={withAdminLayout(ProductsManager)} />
      <Route path="/admin/shop/orders" component={withAdminLayout(OrdersManager)} />
      <Route path="/admin/shop/gift-certificates" component={withAdminLayout(GiftCertificatesManager)} />

      {/* CMS admin */}
      <Route path="/admin/cms/blog" component={withAdminLayout(BlogManager)} />
      <Route path="/admin/cms/testimonials" component={withAdminLayout(TestimonialsManager)} />
      <Route path="/admin/cms/services" component={withAdminLayout(ServicesManager)} />
      <Route path="/admin/cms/gallery" component={withAdminLayout(GalleryManager)} />
      <Route path="/admin/cms/business-info" component={withAdminLayout(BusinessInfoManager)} />
      <Route path="/admin/cms/analytics" component={withAdminLayout(Analytics)} />
      <Route path="/admin" component={withAdminLayout(AdminDashboard)} />

      {/* Fallback */}
      <Route>
        <Layout><NotFound /></Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <RollerDoorLoader />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
