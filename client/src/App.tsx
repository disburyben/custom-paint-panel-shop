import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import RollerDoorLoader from "./components/RollerDoorLoader";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Gallery from "./pages/Gallery";
import Shop from "./pages/Shop";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import AdminTeam from "./pages/AdminTeam";
import CMSDashboard from "./pages/admin/CMSDashboard";
import BlogManager from "./pages/admin/cms/BlogManager";
import TestimonialsManager from "./pages/admin/cms/TestimonialsManager";
import ServicesManager from "./pages/admin/cms/ServicesManager";
import GalleryManager from "./pages/admin/cms/GalleryManager";
import BusinessInfoManager from "./pages/admin/cms/BusinessInfoManager";
import Analytics from "./pages/admin/cms/Analytics";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/services" component={Services} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/shop" component={Shop} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/team" component={AdminTeam} />
        <Route path="/admin/cms" component={CMSDashboard} />
        <Route path="/admin/cms/blog" component={BlogManager} />
        <Route path="/admin/cms/testimonials" component={TestimonialsManager} />
        <Route path="/admin/cms/services" component={ServicesManager} />
        <Route path="/admin/cms/gallery" component={GalleryManager} />
        <Route path="/admin/cms/business-info" component={BusinessInfoManager} />
        <Route path="/admin/cms/analytics" component={Analytics} />
        <Route path="/admin" component={Admin} />
        <Route path="/blog/:slug" component={BlogDetail} />
        <Route path="/blog" component={Blog} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
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
