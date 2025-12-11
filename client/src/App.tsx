import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import { initGA4 } from "@/lib/ga";
import RollerDoorLoader from "./components/RollerDoorLoader";
import Home from "./pages/Home";
import Services from "./pages/Services";
import EnhancedGallery from "./pages/EnhancedGallery";
import Shop from "./pages/Shop";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import AdminTeam from "./pages/AdminTeam";
import CMSDashboard from "./pages/admin/CMSDashboard";
import TestimonialsManager from "./pages/admin/cms/TestimonialsManager";
import ServicesManager from "./pages/admin/cms/ServicesManager";
import EnhancedGalleryManager from "./pages/admin/cms/EnhancedGalleryManager";
import BusinessInfoManager from "./pages/admin/cms/BusinessInfoManager";
import Analytics from "./pages/admin/cms/Analytics";
import CMSSprayers from "./pages/admin/CMSSprayers";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/services" component={Services} />
        <Route path="/gallery" component={EnhancedGallery} />
        <Route path="/shop" component={Shop} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/team" component={AdminTeam} />
        <Route path="/admin/cms" component={CMSDashboard} />
        <Route path="/admin/cms/testimonials" component={TestimonialsManager} />
        <Route path="/admin/cms/services" component={ServicesManager} />
        <Route path="/admin/cms/gallery" component={EnhancedGalleryManager} />
        <Route path="/admin/cms/sprayers" component={CMSSprayers} />
        <Route path="/admin/cms/business-info" component={BusinessInfoManager} />
        <Route path="/admin/cms/analytics" component={Analytics} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  // Initialize GA4 on app load
  useEffect(() => {
    initGA4();
  }, []);

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
