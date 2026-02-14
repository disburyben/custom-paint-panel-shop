import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, Instagram, Facebook, Mail } from "lucide-react";
import { useState, useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/gallery", label: "Gallery" },
    { href: "/shop", label: "Shop" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
          scrolled
            ? "bg-background/90 backdrop-blur-md border-border py-3"
            : "bg-transparent py-6"
        )}
      >
        <div className="container flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center cursor-pointer group">
              <img src="/images/logo-full.png" alt="Caspers Paintworks" className="h-12 w-auto object-contain" />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={cn(
                    "font-heading font-medium text-sm uppercase tracking-widest hover:text-primary transition-colors cursor-pointer relative group py-2",
                    location === link.href ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {link.label}
                  <span className={cn(
                    "absolute bottom-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right group-hover:origin-left",
                    location === link.href && "scale-x-100"
                  )} />
                </span>
              </Link>
            ))}
            <Link href="/contact">
              <Button
                variant="default"
                className="skew-x-[-10deg] font-heading uppercase tracking-wider hover:shadow-[0_0_20px_var(--primary)] transition-all duration-300"
              >
                <span className="skew-x-[10deg]">Get Quote</span>
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-24 px-6 md:hidden flex flex-col gap-6 animate-in slide-in-from-right-10 duration-300">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                className="font-heading text-2xl font-bold uppercase tracking-widest hover:text-primary transition-colors cursor-pointer block border-b border-border/50 pb-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </span>
            </Link>
          ))}
          <Button className="w-full mt-4 font-heading uppercase tracking-wider" size="lg">
            Get a Free Quote
          </Button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow pt-0">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-16 relative overflow-hidden">
        {/* Grid Background Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="container relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="mb-6">
                <img src="/images/logo-full.png" alt="Caspers Paintworks" className="h-16 w-auto object-contain" />
              </div>              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Taking all Automotive Paintwork Enquiries! Premium automotive restoration and custom paint services in Adelaide.
              </p>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/casperspaintworks" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-none border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 group">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-none border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 group">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="col-span-1">
              <h4 className="font-heading font-bold text-lg uppercase mb-6 text-primary">Services</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="hover:text-foreground transition-colors cursor-pointer">Custom Resprays</li>
                <li className="hover:text-foreground transition-colors cursor-pointer">Collision Repair</li>
                <li className="hover:text-foreground transition-colors cursor-pointer">Classic Restoration</li>
                <li className="hover:text-foreground transition-colors cursor-pointer">Detailing & Protection</li>
                <li className="hover:text-foreground transition-colors cursor-pointer">Paint Correction</li>
              </ul>
            </div>

            <div className="col-span-1">
              <h4 className="font-heading font-bold text-lg uppercase mb-6 text-primary">Contact</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary shrink-0" />
                  <a href="tel:+61466254055" className="hover:text-primary transition-colors">+61 466 254 055</a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <a href="mailto:enquiries@casperspaintworks.com.au" className="hover:text-primary transition-colors">enquiries@casperspaintworks.com.au</a>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 text-primary shrink-0 font-heading font-bold">AD</div>
                  <a href="https://maps.google.com/?q=16+Flett+Road+Roseworthy+SA" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">16 Flett Road,<br />Roseworthy, SA</a>
                </li>
              </ul>
            </div>

            <div className="col-span-1">
              <h4 className="font-heading font-bold text-lg uppercase mb-6 text-primary">Hours</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex justify-between border-b border-border/50 pb-2">
                  <span>Mon - Fri</span>
                  <span className="text-foreground font-medium">8:00 AM - 6:00 PM</span>
                </li>
                <li className="flex justify-between border-b border-border/50 pb-2">
                  <span>Saturday</span>
                  <span className="text-foreground font-medium">9:00 AM - 2:00 PM</span>
                </li>
                <li className="flex justify-between pb-2">
                  <span>Sunday</span>
                  <span className="text-destructive">Closed</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground uppercase tracking-wider">
            <p>&copy; {new Date().getFullYear()} Caspers Paintworks. All rights reserved.</p>
            <div className="flex gap-6 items-center">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <Link href="/admin/login">
                <span className="text-muted-foreground/50 hover:text-primary transition-colors cursor-pointer text-[10px]">
                  Admin
                </span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
